import { Router } from 'express';
const router = Router();
import Product from '../models/Product.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Semantic & Full-text search
router.get('/search', async (req, res) => {
  try {
    const queryStr = req.query.q || '';
    if (!queryStr.trim()) {
      return res.json([]);
    }

    const words = queryStr.toLowerCase().split(/\s+/).filter(Boolean);
    
    // Semantic Expansion Dictionary
    const SEMANTIC_DICTIONARY = {
      warm: ['hoodie', 'heavyweight', 'winter', 'sweater', 'jacket', 'fleece', 'wool'],
      cold: ['hoodie', 'heavyweight', 'winter', 'sweater', 'jacket', 'fleece', 'wool'],
      cozy: ['hoodie', 'heavyweight', 'winter', 'sweater', 'jacket', 'fleece', 'wool'],
      winter: ['hoodie', 'heavyweight', 'jacket', 'embroidered', 'fleece'],
      summer: ['t-shirt', 'tee', 'lightweight', 'cotton', 'shorts'],
      hot: ['t-shirt', 'tee', 'lightweight', 'cotton', 'shorts'],
      cool: ['t-shirt', 'tee', 'lightweight', 'cotton', 'shorts'],
      loose: ['oversized', 'relaxed', 'baggy'],
      baggy: ['oversized', 'relaxed', 'loose'],
      big: ['oversized', 'relaxed'],
      traditional: ['calligraphy', 'jp', 'embroidery', 'embroidered', 'heritage'],
      japanese: ['calligraphy', 'jp', 'embroidery', 'embroidered', 'heritage'],
      art: ['calligraphy', 'graphics', 'embroidered', 'print'],
      graphics: ['print', 'tee', 'graphic', 'calligraphy'],
      premium: ['heavyweight', 'luxury', 'quality', 'embroidered'],
      luxury: ['heavyweight', 'premium', 'quality', 'embroidered'],
      heavy: ['heavyweight', 'hoodie'],
      outerwear: ['jacket', 'hoodie', 'zip-up'],
      tops: ['t-shirt', 'tee', 'hoodie', 'sweater'],
    };

    // Find synonyms
    let synonyms = [];
    words.forEach(word => {
      if (SEMANTIC_DICTIONARY[word]) {
        synonyms.push(...SEMANTIC_DICTIONARY[word]);
      }
    });
    // Remove duplicates
    synonyms = [...new Set(synonyms)];

    // Fetch all products to perform hybrid scoring
    const products = await Product.find();

    // Score and filter
    const scoredProducts = products.map(product => {
      let score = 0;
      const name = (product.name || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();
      const jp = (product.jp || '').toLowerCase();
      const badge = (product.badge || '').toLowerCase();

      // 1. Direct word matches
      words.forEach(word => {
        if (name === word) {
          score += 15; // exact match
        } else if (name.includes(word)) {
          score += 10;
        }
        if (cat.includes(word)) {
          score += 6;
        }
        if (jp.includes(word)) {
          score += 6;
        }
        if (badge.includes(word)) {
          score += 4;
        }
        if (desc.includes(word)) {
          score += 3;
        }
      });

      // 2. Semantic synonym matches
      synonyms.forEach(syn => {
        if (name.includes(syn)) {
          score += 5;
        }
        if (cat.includes(syn)) {
          score += 3;
        }
        if (desc.includes(syn)) {
          score += 1.5;
        }
      });

      return { product, score };
    });

    // Filter out products with score = 0 and sort by score descending
    const results = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product with multiple image upload
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, category, price, description, stock, badge, isFeatured } = req.body;
    const imageUrls = req.files ? req.files.map(f => f.path) : [];
    const primaryImage = imageUrls[0] || '';

    const product = new Product({
      name,
      category,
      price: Number(price),
      description,
      stock: Number(stock || 0),
      badge,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      image: primaryImage,
      images: imageUrls,
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (for featured toggle)
router.patch('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
