const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    trim: {
        type: String
    },
    mileage: {
        type: Number,
        // required: true
    },
    price: {
        type: Number,
        // required: true
    },
    transmission: {
        type: String,
        enum: ['automatic', 'manual', 'cvt', 'dualClutch']
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'hybrid', 'electric', 'cng']
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }],
    listedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'pending'],
        default: 'active'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;