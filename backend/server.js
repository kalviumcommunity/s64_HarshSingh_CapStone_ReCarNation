require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport')
const cookieParser = require('cookie-parser');
const session = require('express-session');

const connectDB = require('./db/database');
const authRoutes = require('./features/auth/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

const productRoutes = require('./features/products/productsRoutes');
const PORT = process.env.PORT || 6000;
connectDB();

app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res)=>{
  res.send('Server is running');
})

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});