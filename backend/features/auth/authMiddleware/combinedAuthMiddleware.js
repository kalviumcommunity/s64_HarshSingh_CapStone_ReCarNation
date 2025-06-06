const jwt = require("jsonwebtoken");
const User = require("../../../model/userModel");
const admin = require('../../../config/firebase');
const { getCookieConfig } = require('../../../config/cookieConfig');

exports.authenticate = async (req, res, next) => {
  try {
    // First try Firebase token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (user) {
          // Generate new JWT and set cookie
          const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          res.cookie('token', token, getCookieConfig());
          
          req.user = user;
          return next();
        }
      } catch (error) {
        console.log('Firebase token verification failed, trying JWT cookie');
      }
    }

    // Try JWT cookie if Firebase token fails
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
