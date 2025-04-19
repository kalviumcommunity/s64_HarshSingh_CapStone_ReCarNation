const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../model/userModel");
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    email = email.trim().toLowerCase().replace(/\s+/g, '');
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: "User created", user: { id: user._id, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
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


exports.googleLogin = async (req, res) => {
  const { email, name, googleId, profilePicture } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        email,
        name,
        googleId,
        profilePicture,
        isVerified: true, // Google accounts are pre-verified
      });
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = profilePicture || user.profilePicture;
        user.isVerified = true;
        await user.save();
      }

exports.getAllEmails = async(req, res) => {
    try {
      const users = await User.find({}, "name email"); // Fetch name and email only
      const userList = users.map(user => ({
        name: user.name,
        email: user.email
      }));
      res.status(200).json({ users: userList });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching users");
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
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

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

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


exports.profile = async(req, res)=>{
    try{
        const userid = req.user._id;
        const userProfile = await User.findById(userid);
        if(!userProfile) return res.status(404).json({message:"No such user exist!"});

        res.status(200).json({
            message:"User profile",
            userProfile
        });
    }
    catch(error){
        res.status(400).json({
            message: "Error",
            error: error.message
        });
    }
};

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

