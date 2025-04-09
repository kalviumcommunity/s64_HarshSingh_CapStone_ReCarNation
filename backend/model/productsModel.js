const mongoose = require('mongoose');
const productSchema  = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        company:{
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true,
        },
        year:{
            type: Number,
            required: true,
        },
        description:{
            type: String,
        },
        KilometersTraveled: {
            type: Number,
        }
    }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;