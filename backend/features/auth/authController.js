const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../model/userModel"); // <-- Use Mongoose model
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  let { name, email, password } = req.body;
  try {
    const cleanedEmail = email.trim().toLowerCase().replace(/\s+/g, '');
    const existingUser = await User.findOne({ email: cleanedEmail });
    if (existingUser) return res.status(409).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: cleanedEmail, password: hashed });
    res.status(201).json({ 
      message: "User created", 
      user: { id: user._id, name: user.name } 
    });
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
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });
    res.send({ message: "Logged in", user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

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

