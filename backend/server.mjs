import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import designRoutes from './routes/designRoutes.js';


const app = express();

// Connect to Database
connectDB();

// Middleware - Compression (reduces bandwidth by ~70%)
app.use(compression());

// Middleware - CORS
app.use(
  cors({
    origin: [
      "https://zowears.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true
  })
);

// Middleware - JSON parsing
app.use(express.json());

// Middleware - Cache headers for GET requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    // Cache products and designs for 1 hour
    if (req.path.includes('/api/products') || req.path.includes('/api/designs')) {
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
    // Cache search results for 30 minutes (shorter TTL for search)
    if (req.path.includes('/search')) {
      res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    }
  }
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/designs', designRoutes);


app.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.send('Zowears API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
