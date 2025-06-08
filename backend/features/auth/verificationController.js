const User = require('../../model/userModel');
const admin = require('../../config/firebase');
const auth = admin.auth();

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

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
        phoneNumber: user.phoneNumber,
        verifiedWith: firebaseUser.phoneNumber ? 'phone' : (firebaseUser.emailVerified ? 'email' : null),
        verifiedContact: firebaseUser.phoneNumber || (firebaseUser.emailVerified ? firebaseUser.email : null)
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { type, phone } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Firebase user
    const firebaseUser = await auth.getUser(user.firebaseUid);
    
    // For phone verification, update the user's phone number
    if (type === 'phone' && phone) {
      // Since phone verification is handled by Firebase Client SDK,
      // we just need to update our user model with the verified phone
      user.phoneNumber = phone;
    }

    // Update verification status based on Firebase
    user.isVerified = firebaseUser.emailVerified || !!firebaseUser.phoneNumber;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        verifiedWith: firebaseUser.phoneNumber ? 'phone' : (firebaseUser.emailVerified ? 'email' : null),
        verifiedContact: firebaseUser.phoneNumber || (firebaseUser.emailVerified ? firebaseUser.email : null)
      }
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to verify user'
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
      url: `${process.env.FRONTEND_URL}/verify-email`,
      handleCodeInApp: true
    };

    const link = await auth.generateEmailVerificationLink(
      firebaseUser.email, 
      actionCodeSettings
    );

    // TODO: Send this link via email using your email service
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

    // Update MongoDB user verification status and phone if verified
    user.isVerified = firebaseUser.emailVerified || !!firebaseUser.phoneNumber;
    if (firebaseUser.phoneNumber && !user.phoneNumber) {
      user.phoneNumber = firebaseUser.phoneNumber;
    }
    await user.save();

    res.json({
      success: true,
      isVerified: user.isVerified,
      emailVerified: firebaseUser.emailVerified,
      phoneVerified: !!firebaseUser.phoneNumber,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
      verifiedWith: firebaseUser.phoneNumber ? 'phone' : (firebaseUser.emailVerified ? 'email' : null),
      verifiedContact: firebaseUser.phoneNumber || (firebaseUser.emailVerified ? firebaseUser.email : null)
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to check verification status' 
    });
  }
};
