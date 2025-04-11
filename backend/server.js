require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
// const session = require('express-session');

const connectDB = require('./db/database');
const authRoutes = require('./features/auth/authRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());


const productRoutes = require('./features/products/productsRoutes');
const PORT = process.env.PORT || 6000;
connectDB();

app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});