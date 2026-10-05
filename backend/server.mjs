import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import designRoutes from './routes/designRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import colorRoutes from './routes/colorRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';


const app = express();

// Middleware - Database connection for serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Middleware - Compression (reduces bandwidth by ~70%)
app.use(compression());

// Middleware - CORS
const corsOptions = {
  origin: [
    "https://www.zowears.com",
    "https://zowears.com",
    "https://zowears.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Handle preflight OPTIONS requests explicitly (required for Vercel serverless)
app.options('/*name', cors(corsOptions));
app.use(cors(corsOptions));

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
app.use('/api/categories', categoryRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);


app.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.send('Zowears API is running...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
