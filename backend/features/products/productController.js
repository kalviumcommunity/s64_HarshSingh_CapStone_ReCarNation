const Product = require('../../model/productsModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg, and .webp files are allowed!'));
    }
}).array('images', 10);

class ProductController {
    static async createProduct(req, res) {
        try {
            upload(req, res, async function(err) {
                if (err) {
                    return res.status(400).json({ message: err.message });
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

                if (!make || !model || !year || !mileage || !price || !location || !contactNumber) {
                    return res.status(400).json({ message: "Required fields are missing" });
                }

                try {
                    // Upload images to Cloudinary
                    const uploadPromises = req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                {
                                    folder: 'car-listings',
                                    resource_type: 'auto',
                                },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve({
                                        url: result.secure_url,
                                        publicId: result.public_id
                                    });
                                }
                            );

                            const bufferStream = require('stream').Readable.from(file.buffer);
                            bufferStream.pipe(uploadStream);
                        });
                    });

                    const uploadedImages = await Promise.all(uploadPromises);

                    const product = new Product({
                        make,
                        model,
                        year,
                        trim,
                        mileage: parseInt(mileage),
                        price: parseFloat(price),
                        transmission,
                        fuelType,
                        description,
                        location,
                        contactNumber,
                        images: uploadedImages,
                        listedBy: req.user._id
                    });

                    const savedProduct = await product.save();
                    res.status(201).json({
                        message: 'Product created successfully',
                        product: savedProduct
                    });
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError);
                    res.status(500).json({ message: 'Error uploading images to cloud storage' });
                }
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllProducts(req, res) {
        try {
            const products = await Product.find()
                .populate('listedBy', 'name email')
                .sort({ createdAt: -1 });
            
            res.status(200).json({
                message: 'Products fetched successfully',
                products
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id)
                .populate('listedBy', 'name email');

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json({
                message: 'Product fetched successfully',
                product
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Handle new image uploads if any
            if (req.files && req.files.length > 0) {
                const uploadPromises = req.files.map(file => {
                    return new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'car-listings',
                                resource_type: 'auto',
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve({
                                    url: result.secure_url,
                                    publicId: result.public_id
                                });
                            }
                        );

                        const bufferStream = require('stream').Readable.from(file.buffer);
                        bufferStream.pipe(uploadStream);
                    });
                });

                const newImages = await Promise.all(uploadPromises);
                updates.images = [...updates.images || [], ...newImages];
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('listedBy', 'name email');

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json({
                message: 'Product updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Delete images from Cloudinary
            if (product.images && product.images.length > 0) {
                const deletePromises = product.images.map(image => 
                    cloudinary.uploader.destroy(image.publicId)
                );
                await Promise.all(deletePromises);
            }

            await Product.findByIdAndDelete(id);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
