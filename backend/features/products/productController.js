const Product = require('../../model/productsModel');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const mongoose = require('mongoose');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class ProductController {
    static async createProduct(req, res) {
        try {
            console.log('Request body:', req.body);
            console.log('Request files:', req.files);

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
                contactNumber,
                userId
            } = req.body;

            // Validate required fields
            if (!make || !model || !year || !mileage || !price || !location || !contactNumber) {
                return res.status(400).json({ message: 'All required fields must be filled' });
            }

            // Upload images to Cloudinary if present
            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                imageUrls = await Promise.all(
                    req.files.map(async (file) => {
                        try {
                            const result = await cloudinary.uploader.upload(file.path, {
                                folder: 'car_listings'
                            });
                            return result.secure_url;
                        } catch (uploadError) {
                            console.error('Error uploading image:', uploadError);
                            throw new Error('Failed to upload images');
                        }
                    })
                );
            }
            
            // Create new product
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
                images: imageUrls,
                listedBy: new mongoose.Types.ObjectId(userId)
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
    }

    static async getAllProducts(req, res) {
        try {
            const { 
                minPrice, 
                maxPrice, 
                minYear, 
                maxYear, 
                make, 
                model, 
                features, 
                sort, 
                order, 
                limit 
            } = req.query;

            // Build query object
            let query = {};
            
            // Price range filter
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = parseFloat(minPrice);
                if (maxPrice) query.price.$lte = parseFloat(maxPrice);
            }

            // Year range filter
            if (minYear || maxYear) {
                query.year = {};
                if (minYear) query.year.$gte = parseInt(minYear);
                if (maxYear) query.year.$lte = parseInt(maxYear);
            }

            // Make and model filters
            if (make) query.make = make;
            if (model) query.model = model;

            // Features filter
            if (features) {
                const featureList = features.split(',');
                query.features = { $all: featureList };
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

            res.status(200).json({
                message: 'Fetched all products successfully!',
                products
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error: error.message });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching product', error: error.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(updatedProduct);
        } catch (error) {
            res.status(500).json({ message: 'Error updating product', error: error.message });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product', error: error.message });
        }
    }
}

module.exports = ProductController;


