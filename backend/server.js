const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./db/database');
app.use(express.json());

const productRoutes = require('./features/products/productsRoutes');
const PORT = process.env.PORT;
connectDB();

app.use('/api/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});