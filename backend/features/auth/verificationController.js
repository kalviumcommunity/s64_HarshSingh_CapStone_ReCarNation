const User = require('../../model/userModel');
const jwt = require('jsonwebtoken');

exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
        isVerified: user.isVerified,
        photo: user.profilePicture || "https://via.placeholder.com/32",
        phoneNumber: user.phone,
        verifiedWith: user.verifiedWith,
        verifiedContact: user.verifiedContact
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { type, phone, email } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For phone verification, update the user's phone number
    if (type === 'phone' && phone) {
      user.phone = phone;
      user.verifiedWith = 'phone';
      user.verifiedContact = phone;
    }

    // For email verification
    if (type === 'email' && email) {
      user.verifiedWith = 'email';
      user.verifiedContact = email;
    }

    // Update verification status
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        verifiedWith: user.verifiedWith,
        verifiedContact: user.verifiedContact
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

    // TODO: Implement email verification logic (send OTP, etc.)
    // For now, we'll just return success
    console.log('Email verification requested for:', email);

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

    res.json({
      success: true,
      isVerified: user.isVerified,
      emailVerified: user.verifiedWith === 'email',
      phoneVerified: user.verifiedWith === 'phone',
      email: user.email,
      phone: user.phone,
      verifiedWith: user.verifiedWith,
      verifiedContact: user.verifiedContact
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to check verification status' 
    });
  }
};
