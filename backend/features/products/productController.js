const Product = require('../../model/productsModel');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createProduct = async (req, res) => { 
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        const {
            make,
            model,
            year,
            trim,
            mileage,
            price,
            transmission,
            fuelType,
            description,
            location,
            contactNumber
        } = req.body;

        // Validate required fields
        if (!make || !model || !year || !mileage || !price || !location || !contactNumber) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        const images = await Promise.all(
            req.files.map(async (file) => {
              try {
                const result = await cloudinary.uploader.upload(file.path, {
                  folder: 'car_listings'
                });
                return {
                  url: result.secure_url,
                  publicId: result.public_id
                };
              } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                throw new Error('Failed to upload images');
              }
            })
          );
          

        // Create new product with proper image format and listedBy field
        const newProduct = new Product({
            make,
            model,
            year: parseInt(year),
            trim,
            mileage: parseInt(mileage),
            price: parseFloat(price),
            transmission,
            fuelType,
            description,
            location,
            contactNumber,
            images: images,
            listedBy: req.user._id // Get from authenticated user
        });

        const savedProduct = await newProduct.save();
        console.log('Product created successfully:', savedProduct);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            message: 'Error creating product', 
            error: error.message,
            details: error.stack 
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { featured, limit, sort, order } = req.query;
        let query = {};

        // If featured is true, only return featured cars
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Build sort object
        let sortOptions = {};
        if (sort) {
            sortOptions[sort] = order === 'desc' ? -1 : 1;
        } else {
            // Default sort by creation date if no sort specified
            sortOptions.createdAt = -1;
        }

        // Execute query with options
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit) || 0);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const {
            make,
            model,
            year,
            trim,
            mileage,
            price,
            transmission,
            fuelType,
            description,
            location,
            contactNumber
        } = req.body;

        // Convert numeric fields
        const updates = {
            ...req.body,
            year: year ? parseInt(year) : undefined,
            mileage: mileage ? parseInt(mileage) : undefined,
            price: price ? parseFloat(price) : undefined
        };

        // Remove undefined values
        Object.keys(updates).forEach(key => 
            updates[key] === undefined && delete updates[key]
        );

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { 
                new: true,
                runValidators: true // This ensures enum validations are run
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            message: 'Error updating product', 
            error: error.message,
            details: error.stack
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

const getUserProducts = async (req, res) => {
    try {
        const products = await Product.find({ listedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user products', 
            error: error.message 
        });
    }
};

const getAllProductsAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const products = await Product.find()
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching all products', 
            error: error.message 
        });
    }
};

// Add new images to an existing product
const addImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Upload new images to Cloudinary
        const newImages = await Promise.all(
            req.files.map(async (file) => {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'car_listings'
                    });
                    return {
                        url: result.secure_url,
                        publicId: result.public_id
                    };
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw new Error('Failed to upload images');
                }
            })
        );

        // Add new images to the product
        product.images = [...product.images, ...newImages];
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error adding images:', error);
        res.status(500).json({ 
            message: 'Error adding images', 
            error: error.message,
            details: error.stack 
        });
    }
};

// Remove an image from a product
const removeImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find the image to remove
        const imageToRemove = product.images.find(img => img._id.toString() === imageId);
        if (!imageToRemove) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Delete from Cloudinary
        if (imageToRemove.publicId) {
            try {
                await cloudinary.uploader.destroy(imageToRemove.publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }

        // Remove image from product
        product.images = product.images.filter(img => img._id.toString() !== imageId);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ 
            message: 'Error removing image', 
            error: error.message,
            details: error.stack 
        });
    }
};

// Add new exports
module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getUserProducts,
    getAllProductsAdmin,
    addImages,
    removeImage
};
