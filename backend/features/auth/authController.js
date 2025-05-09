const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../model/userModel");
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const JWT_SECRET = process.env.JWT_SECRET;

// Signup
exports.signup = async (req, res) => {
  let { name, email, password } = req.body;
  try {
    email = email.trim().toLowerCase().replace(/\s+/g, '');
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      message: "User created",
      user: { id: user._id, name: user.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { email, name, googleId, profilePicture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        profilePicture,
        isVerified: true,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = profilePicture || user.profilePicture;
        user.isVerified = true;
        await user.save();
      }
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.json({
      message: "Logged in with Google successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
};

// Get All Users' Emails
exports.getAllEmails = async (req, res) => {
  try {
    const users = await User.find({}, "name email role lastLogin isVerified");
    const userList = users.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      isVerified: user.isVerified
    }));
    res.status(200).json({ users: userList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Profile
exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await User.findById(userId).select('-password');
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        profilePicture: userProfile.profilePicture,
        googleId: userProfile.googleId,
        isVerified: userProfile.isVerified
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      message: "User deleted successfully!",
      user: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error",
      error: error.message
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    // The user is already attached to the request by the isAuthenticated middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the full user data from the database
    const userData = await User.findById(user.id).select('-password');
    
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data in the format expected by the frontend
    const formattedUser = {
      _id: userData._id,
      firstName: userData.name.split(' ')[0], // Assuming first name is the first part of the name
      lastName: userData.name.split(' ').slice(1).join(' '), // Rest of the name as last name
      email: userData.email,
      photo: userData.profilePicture, // Map profilePicture to photo
      role: userData.role,
      isVerified: userData.isVerified
    };

    res.status(200).json({ user: formattedUser });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update User Role
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating role",
      error: error.message
    });
  }
};

// Profile Image Upload
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file, 'profile-pictures');
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({
      message: "Error uploading profile picture",
      error: error.message
    });
  }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary using the helper function
    const result = await uploadToCloudinary(req.file);

    // Update user's profile picture URL in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: result.secure_url
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};
