const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      googleId: {
        type: String,
        default: null, // If the user signed in with Google
      },
      password: {
        type: String,
        default: null, // If the user registered traditionally
        select : false // Now User.find() or User.findOne() won't return the password field unless you explicitly ask for it with .select('+password')
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
      lastLogin: {
        type: Date,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedWith: {
        type: String,
        enum: ['phone', 'email', null],
        default: null
      },
      verifiedContact: {
        type: String,
        default: null
      }
    },{timestamps: true});
    
    module.exports = mongoose.model('User', userSchema);
    
