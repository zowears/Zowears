import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import designRoutes from './routes/designRoutes.js';


const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "https://zowears.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true
  })
);
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/designs', designRoutes);


app.get('/', (req, res) => {
  res.send('Zowears API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
