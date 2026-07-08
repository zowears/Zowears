import { Router } from 'express';
const router = Router();
import Product from '../models/Product.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-__v'),
      Product.countDocuments()
    ]);

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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

    // Use MongoDB text search with proper indexes
    const products = await Product.find(
      { $text: { $search: queryStr } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, isFeatured: -1 })
      .limit(20)
      .lean()
      .select('-__v');

    res.json(products);
  } catch (error) {
    // Fallback to regex search if text search fails
    try {
      const regex = new RegExp(req.query.q, 'i');
      const products = await Product.find({
        $or: [
          { name: regex },
          { category: regex },
          { jp: regex },
          { badge: regex }
        ]
      })
        .limit(20)
        .lean()
        .select('-__v');
      res.json(products);
    } catch (fallbackError) {
      res.status(500).json({ message: fallbackError.message });
    }
  }
});

// Get single product (by ID or Slug)
router.get('/:idOrSlug', async (req, res) => {
  try {
    let product;
    const isObjectId = req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    if (isObjectId) {
      product = await Product.findById(req.params.idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ slug: req.params.idOrSlug });
    }
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product with multiple image upload
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, category, price, description, stock, badge, isFeatured, jp, compareAt } = req.body;
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
      jp,
      compareAt: compareAt ? Number(compareAt) : undefined,
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
