require('dotenv').config();
const express = require('express');
const passport = require('passport');
// Import passport configuration with GoogleStrategy
require('./features/auth/authMiddleware/passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const session = require('express-session');

const connectDB = require('./db/database');
const authRoutes = require('./features/auth/authRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({ 
  secret: process.env.SESSION_SECRET || "secret", 
  resave: false, 
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const productRoutes = require('./features/products/productsRoutes');
const wishlistRoutes = require('./features/wishlist/wishlistRoutes');
const PORT = process.env.PORT || 3001;
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res)=>{
  res.send('Server is running');
})

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});