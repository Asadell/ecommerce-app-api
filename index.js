const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const userRoute = require('./src/routes/userRoutes');
const authRoute = require('./src/routes/authRoutes');
const productRoute = require('./src/routes/productRoutes');

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DBConnection successfull!'))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/products', productRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
