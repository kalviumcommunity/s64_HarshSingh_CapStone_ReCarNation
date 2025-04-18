require('dotenv').config();
const express = require('express');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const cors = require('cors');

const session = require('express-session');


const connectDB = require('./db/database');
const authRoutes = require('./features/auth/authRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({ secret: "secret", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

const productRoutes = require('./features/products/productsRoutes');
const PORT = process.env.PORT || 3000;
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res)=>{
  res.send('Server is running');
})

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});