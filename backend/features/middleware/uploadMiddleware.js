const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Create multer instance with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg, and .webp files are allowed!'));
    }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file, folder = 'profile-pictures') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: 'image'
        });
        
        // Clean up local file after successful upload
        fs.unlinkSync(file.path);
        
        return result;
    } catch (error) {
        // Clean up local file if upload fails
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw error;
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};