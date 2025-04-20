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

    // Create token with proper user ID (matching what middleware expects)
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with appropriate settings (secure:false in development)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only true in production
      sameSite: "Lax", // Less strict for cross-domain
      maxAge: 3600000, // 1 hour
    });

    // Create a user object with essential data for localStorage
    // Convert MongoDB ObjectId to string to ensure proper serialization
    const userData = {
      id: user._id.toString(), // Convert ObjectId to string
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      profilePicture: user.profilePicture,
      googleId: user.googleId
    };

    // Pre-stringify the user data to avoid template interpolation issues
    const userDataJson = JSON.stringify(userData);
    console.log("User data prepared for client:", userDataJson);

    // Send HTML response with multiple fallback mechanisms
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .loader { 
              border: 5px solid #f3f3f3; 
              border-top: 5px solid #3498db; 
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .fallback-link { display: none; margin-top: 20px; }
            .fallback-link a { 
              display: inline-block; 
              padding: 10px 20px; 
              background-color: #4285f4; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h2>Authentication Successful!</h2>
          <p>Redirecting to your profile...</p>
          <div class="loader"></div>
          
          <div class="fallback-link" id="fallbackLink">
            <p>If you're not redirected automatically, please click below:</p>
            <a href="http://localhost:5173/profile">Go to Profile</a>
          </div>
          
          <script>
            // Show fallback link after 5 seconds if redirect doesn't work
            setTimeout(() => {
              document.getElementById('fallbackLink').style.display = 'block';
            }, 5000);
            
            try {
              // Store user data directly from the server
              const userData = ${userDataJson};
              
              // Verify userData is valid before storing
              if (userData && userData.id && userData.email) {
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('User authenticated successfully:', userData.email);
                
                // Redirect to profile page after ensuring localStorage is set
                setTimeout(() => {
                  window.location.href = 'http://localhost:5173/profile';
                }, 1000);
              } else {
                console.error('Invalid user data received:', userData);
                window.location.href = 'http://localhost:5173/login?error=invalid_data';
              }
            } catch (error) {
              console.error('Error processing authentication data:', error);
              window.location.href = 'http://localhost:5173/login?error=auth_failed';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google authentication error:", error);
    res.redirect("http://localhost:5173/login?error=auth_failed");
  }
};
