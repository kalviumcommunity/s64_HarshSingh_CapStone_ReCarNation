const jwt = require("jsonwebtoken");
const User = require("../../../model/userModel");

exports.googleCallback = async (req, res) => {
  try {
    // Extract user information from Google profile
    const email = req.user.emails[0].value;
    const name = req.user.displayName || req.user.name?.givenName;
    const googleId = req.user.id;
    const profilePicture = req.user.photos?.[0]?.value || null;

    // Find existing user or create a new one
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if one doesn't exist
      user = await User.create({
        email,
        name,
        googleId,
        profilePicture,
        isVerified: true,
      });
      console.log("Created new user from Google auth:", user.email);
    } else if (!user.googleId) {
      // Update existing user with Google info if they don't have googleId
      user.googleId = googleId;
      user.profilePicture = profilePicture || user.profilePicture;
      user.isVerified = true;
      await user.save();
      console.log("Updated existing user with Google info:", user.email);
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Create token with proper user ID
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with appropriate settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour
    });

    // Create user data for localStorage
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      profilePicture: user.profilePicture,
      googleId: user.googleId
    };

    // Send HTML response with script to set localStorage and redirect
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            // Store user data in localStorage
            localStorage.setItem('user', '${JSON.stringify(userData)}');
            localStorage.setItem('token', '${token}');
            
            // Redirect to home page
            window.location.href = 'http://localhost:5173/home';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect("http://localhost:5173/login?error=auth_failed");
  }
};
