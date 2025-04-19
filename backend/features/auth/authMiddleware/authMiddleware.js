const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  console.log("Authentication check - Token:", token ? "Present" : "Missing");
  console.log("Cookies received:", req.cookies);
  
  if (!token) {
    console.log("Authentication failed: No token provided");
    return res.status(401).json({ message: "Not authenticated - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully for user:", decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authenticated - Invalid token" });
  }
};
