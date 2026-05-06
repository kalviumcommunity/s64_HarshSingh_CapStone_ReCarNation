const Product = require('../../model/productsModel');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { cacheGet, cacheSet, cacheDel, cacheDelPattern } = require('../../config/redis');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Cache TTLs ──────────────────────────────────────────────────────────────
const CACHE_TTL = {
    LIST: 60,        // 1 minute for paginated/filtered lists
    SINGLE: 300,     // 5 minutes for individual product
    METADATA: 600,   // 10 minutes for make/model/year metadata
};

const createProduct = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        const {
            make, model, year, trim, mileage, price,
            transmission, fuelType, description, location, contactNumber
        } = req.body;

        const images = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const result = await cloudinary.uploader.upload(file.path, { folder: 'car_listings' });
                    return { url: result.secure_url, publicId: result.public_id };
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw new Error('Failed to upload images');
                }
            })
        );

        const newProduct = new Product({
            make, model,
            year: parseInt(year),
            trim,
            mileage: parseInt(mileage),
            price: parseFloat(price),
            transmission, fuelType, description, location, contactNumber,
            images,
            listedBy: req.user._id
        });

        const savedProduct = await newProduct.save();

        // Invalidate list and metadata caches — new product changes them
        await Promise.all([
            cacheDelPattern('products:list:*'),
            cacheDel('products:metadata'),
        ]);

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const {
            featured, limit, sort, order,
            minPrice, maxPrice, minYear, maxYear,
            make, model, features, search
        } = req.query;

        // Build a deterministic cache key from query params
        const cacheKey = `products:list:${JSON.stringify({
            featured, limit, sort, order,
            minPrice, maxPrice, minYear, maxYear,
            make, model, features, search
        })}`;

        // Try cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.json({ ...cached, fromCache: true });
        }

        let query = {};

        if (featured === 'true') query.isFeatured = true;

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
        }

        if (minYear !== undefined || maxYear !== undefined) {
            query.year = {};
            if (minYear !== undefined) query.year.$gte = parseInt(minYear);
            if (maxYear !== undefined) query.year.$lte = parseInt(maxYear);
        }

        if (make) query.make = make;
        if (model) query.model = model;

        if (features) {
            const featureList = features.split(',').map(f => f.trim());
            if (featureList.length > 0) query.features = { $all: featureList };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { make: searchRegex },
                { model: searchRegex },
                { description: searchRegex },
                { location: searchRegex }
            ];
        }

        let sortOptions = {};
        if (sort) {
            sortOptions[sort] = order === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = -1;
        }

        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit) || 0);

        const result = { products, total: products.length };

        // Cache the result
        await cacheSet(cacheKey, result, CACHE_TTL.LIST);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const cacheKey = `products:single:${req.params.id}`;

        // Try cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.json({ ...cached, fromCache: true });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await cacheSet(cacheKey, product.toObject(), CACHE_TTL.SINGLE);

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { year, mileage, price } = req.body;

        const updates = {
            ...req.body,
            year: year ? parseInt(year) : undefined,
            mileage: mileage ? parseInt(mileage) : undefined,
            price: price ? parseFloat(price) : undefined
        };

        Object.keys(updates).forEach(key =>
            updates[key] === undefined && delete updates[key]
        );

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Invalidate this product's cache and all list caches
        await Promise.all([
            cacheDel(`products:single:${req.params.id}`),
            cacheDelPattern('products:list:*'),
        ]);

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Invalidate caches
        await Promise.all([
            cacheDel(`products:single:${req.params.id}`),
            cacheDelPattern('products:list:*'),
            cacheDel('products:metadata'),
        ]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

const getUserProducts = async (req, res) => {
    try {
        const products = await Product.find({ listedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user products', error: error.message });
    }
};

const getAllProductsAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all products', error: error.message });
    }
};

const addImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newImages = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const result = await cloudinary.uploader.upload(file.path, { folder: 'car_listings' });
                    return { url: result.secure_url, publicId: result.public_id };
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw new Error('Failed to upload images');
                }
            })
        );

        product.images = [...product.images, ...newImages];
        const updatedProduct = await product.save();

        // Invalidate single product cache
        await cacheDel(`products:single:${req.params.id}`);

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error adding images:', error);
        res.status(500).json({ message: 'Error adding images', error: error.message });
    }
};

const removeImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const imageToRemove = product.images.find(img => img._id.toString() === imageId);
        if (!imageToRemove) {
            return res.status(404).json({ message: 'Image not found' });
        }

        if (imageToRemove.publicId) {
            try {
                await cloudinary.uploader.destroy(imageToRemove.publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }

        product.images = product.images.filter(img => img._id.toString() !== imageId);
        const updatedProduct = await product.save();

        // Invalidate single product cache
        await cacheDel(`products:single:${id}`);

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ message: 'Error removing image', error: error.message });
    }
};

const getProductsMetadata = async (req, res) => {
    try {
        const cacheKey = 'products:metadata';

        // Try cache first
        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.json({ ...cached, fromCache: true });
        }

        const products = await Product.find({});

        const makeModels = {};
        const years = [];
        const prices = [];

        products.forEach(product => {
            if (product.make) {
                if (!makeModels[product.make]) makeModels[product.make] = new Set();
                if (product.model) makeModels[product.make].add(product.model);
            }
            if (product.year) years.push(product.year);
            if (product.price) prices.push(product.price);
        });

        const metadata = {
            makes: Object.keys(makeModels).sort(),
            models: Object.fromEntries(
                Object.entries(makeModels).map(([make, models]) => [make, Array.from(models).sort()])
            ),
            yearRange: [
                Math.min(...years) || 2000,
                Math.max(...years) || new Date().getFullYear()
            ],
            priceRange: [
                Math.min(...prices) || 0,
                Math.max(...prices) || 10000000
            ]
        };

        await cacheSet(cacheKey, metadata, CACHE_TTL.METADATA);

        res.json(metadata);
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        res.status(500).json({ message: 'Error fetching product metadata' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getUserProducts,
    getAllProductsAdmin,
    addImages,
    removeImage,
    getProductsMetadata
};
