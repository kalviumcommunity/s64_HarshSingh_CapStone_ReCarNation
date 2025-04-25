const mongoose = require('mongoose');
const productSchema  = new mongoose.Schema({
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
        },
        listedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
          },
          image:{
            type : String // path/url to the file/image
          }
    },{timestamps: true}
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;