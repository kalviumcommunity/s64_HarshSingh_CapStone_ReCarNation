const User = require('../../model/userModel');
const admin = require('../../config/firebase');
const auth = admin.auth();

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Firebase user
    const firebaseUser = await auth.getUser(user.firebaseUid);

    // Format name into firstName and lastName
    const nameParts = user.name ? user.name.split(' ') : ['', ''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    res.json({
      user: {
        id: user._id,
        firstName,
        lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: firebaseUser.emailVerified || !!firebaseUser.phoneNumber,
        photo: user.profilePicture || "https://via.placeholder.com/32",
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Firebase user
    const firebaseUser = await auth.getUser(user.firebaseUid);
    
    // Update verification status based on Firebase
    user.isVerified = firebaseUser.emailVerified || !!firebaseUser.phoneNumber;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.startPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Create a session cookie with Firebase
    try {
      const phoneAuthProvider = new auth.PhoneAuthProvider();
      const verificationId = await phoneAuthProvider.createVerificationSession(phone);
      
      res.json({ 
        success: true,
        verificationId,
        message: 'Verification code sent successfully'
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
      });
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to start phone verification' 
    });
  }
};

exports.startEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Get Firebase user
    const firebaseUser = await auth.getUser(user.firebaseUid);

    // Generate email verification link
    const actionCodeSettings = {
      url: process.env.FRONTEND_URL + '/profile',
    };

    const link = await auth.generateEmailVerificationLink(
      firebaseUser.email, 
      actionCodeSettings
    );

    // In production, you would send this link via email
    console.log('Email verification link:', link);

    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send verification email' 
    });
  }
};

exports.checkVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Firebase user status
    const firebaseUser = await auth.getUser(user.firebaseUid);

    // Update MongoDB user verification status
    user.isVerified = firebaseUser.emailVerified || !!firebaseUser.phoneNumber;
    await user.save();

    res.json({
      success: true,
      isVerified: user.isVerified,
      emailVerified: firebaseUser.emailVerified,
      phoneVerified: !!firebaseUser.phoneNumber,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to check verification status' 
    });
  }
};
