const admin = require('../../../config/firebase');
const User = require('../../../model/userModel');

exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Find or create user
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user if not found
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        phoneNumber: decodedToken.phone_number,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
