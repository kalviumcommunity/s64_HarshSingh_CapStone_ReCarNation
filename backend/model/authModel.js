const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
      },
      googleId: {
        type: String,
        default: null, // If the user signed in with Google
      },
      password: {
        type: String,
        default: null, // If the user registered traditionally
      },
      profilePicture: {
        type: String, 
        default: null,
      },
      role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      lastLogin: {
        type: Date,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    });
    
    module.exports = mongoose.model('User', userSchema);
    
