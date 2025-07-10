const jwt = require("jsonwebtoken");
const User = require("../../../model/userModel");
const { getCookieConfig } = require('../../../config/cookieConfig');

exports.authenticate = async (req, res, next) => {
  console.log('🔒 JWT AUTH MIDDLEWARE CALLED');
  console.log('Headers:', req.headers.authorization ? 'Bearer token present' : 'No bearer token');
  console.log('Cookies:', req.cookies.token ? 'JWT cookie present' : 'No JWT cookie');
  
  try {
    // First try Bearer token (JWT)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          // Set cookie for future requests
          res.cookie('token', token, getCookieConfig());
          req.user = user;
          return next();
        }
      } catch (error) {
        console.log('Bearer token verification failed, trying JWT cookie');
      }
    }

    // Try JWT cookie if Bearer token fails
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          req.user = user;
          return next();
        }
      } catch (error) {
        console.log('JWT cookie verification failed');
      }
    }

    // If both authentication methods fail
    return res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
