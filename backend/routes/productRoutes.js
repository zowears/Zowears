import { Router } from 'express';
const router = Router();
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

// Helper to resolve category ID from ObjectId, Slug, or Name
const resolveCategoryId = async (categoryInput) => {
  if (!categoryInput) return null;
  
  // Check if it's a valid ObjectId
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryInput);
  if (isObjectId) {
    const categoryDoc = await Category.findById(categoryInput).lean();
    if (categoryDoc) return categoryDoc._id;
  }
  
  // If not found or not ObjectId, search by slug or name (case-insensitive)
  const categoryDoc = await Category.findOne({
    $or: [
      { slug: categoryInput },
      { name: new RegExp(`^${categoryInput}$`, 'i') }
    ]
  }).lean();
  
  return categoryDoc ? categoryDoc._id : null;
};

// Get all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;
    
    const query = { status: 'active' };
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    
    // Filter by color
    if (req.query.color) {
      query['colors.name'] = req.query.color;
    }
    
    // Filter by size
    if (req.query.size) {
      query.sizes = req.query.size;
    }
    
    // Filter low stock
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-__v'),
      Product.countDocuments(query)
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

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const products = await Product.find({ 
      isFeatured: true, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .limit(limit)
      .lean();
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const queryStr = req.query.q || '';
    if (!queryStr.trim()) {
      return res.json([]);
    }

    // Use MongoDB text search with proper indexes
    const products = await Product.find(
      { $text: { $search: queryStr }, status: 'active' },
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
        status: 'active',
        $or: [
          { name: regex },
          { description: regex },
          { jp: regex }
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
      product = await Product.findById(req.params.idOrSlug)
        .populate('category', 'name slug');
    }
    
    if (!product) {
      product = await Product.findOne({ slug: req.params.idOrSlug })
        .populate('category', 'name slug');
    }
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product with full details
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      brand,
      status,
      isFeatured,
      costPrice,
      price,
      comparePrice,
      stock,
      lowStockThreshold,
      trackInventory,
      colors,
      sizes,
      jp,
      badge
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ 
        message: 'Name, category, and price are required' 
      });
    }

    // Resolve and validate category
    const categoryId = await resolveCategoryId(category);
    if (!categoryId) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Process images
    const images = req.files ? req.files.map((f, idx) => ({
      url: f.path,
      isPrimary: idx === 0
    })) : [];

    const primaryImage = images.length > 0 ? images[0].url : '';

    // Parse colors (if sent as JSON string)
    let parsedColors = [];
    if (colors) {
      try {
        parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        parsedColors = Array.isArray(colors) ? colors : [];
      }
    }

    // Parse sizes (if sent as JSON string)
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        parsedSizes = Array.isArray(sizes) ? sizes : [];
      }
    }

    const product = new Product({
      name,
      sku,
      description,
      category: categoryId,
      brand,
      status: status || 'active',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      costPrice: Number(costPrice) || 0,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : undefined,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      trackInventory: trackInventory === 'true' || trackInventory === true,
      colors: parsedColors,
      sizes: parsedSizes,
      images,
      image: primaryImage,
      jp,
      badge
    });

    const newProduct = await product.save();
    await newProduct.populate('category', 'name slug');
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.patch('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      brand,
      status,
      isFeatured,
      costPrice,
      price,
      comparePrice,
      stock,
      lowStockThreshold,
      trackInventory,
      colors,
      sizes,
      jp,
      badge,
      removeImages
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update basic info
    if (name) product.name = name;
    if (sku) product.sku = sku;
    if (description) product.description = description;
    if (category) {
      const categoryId = await resolveCategoryId(category);
      if (!categoryId) {
        return res.status(400).json({ message: 'Category not found' });
      }
      product.category = categoryId;
    }
    if (brand) product.brand = brand;
    if (status) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (jp) product.jp = jp;
    if (badge) product.badge = badge;

    // Update pricing
    if (costPrice !== undefined) product.costPrice = Number(costPrice);
    if (price) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = comparePrice ? Number(comparePrice) : undefined;

    // Update inventory
    if (stock !== undefined) product.stock = Number(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (trackInventory !== undefined) product.trackInventory = trackInventory === 'true' || trackInventory === true;

    // Update variants
    if (colors) {
      try {
        product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        product.colors = Array.isArray(colors) ? colors : [];
      }
    }

    if (sizes) {
      try {
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        product.sizes = Array.isArray(sizes) ? sizes : [];
      }
    }

    // Handle image updates
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        url: f.path,
        isPrimary: false
      }));
      product.images = [...(product.images || []), ...newImages];
    }

    // Remove specific images if requested
    if (removeImages) {
      try {
        const urlsToRemove = typeof removeImages === 'string' 
          ? JSON.parse(removeImages) 
          : removeImages;
        product.images = product.images.filter(img => 
          !urlsToRemove.includes(img.url)
        );
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Ensure at least one primary image
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    // Update primary image for backward compatibility
    if (product.images.length > 0) {
      const primaryImg = product.images.find(img => img.isPrimary);
      product.image = primaryImg ? primaryImg.url : product.images[0].url;
    }

    const updatedProduct = await product.save();
    await updatedProduct.populate('category', 'name slug');

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update status
router.patch('/admin/bulk/status', auth, async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || !status) {
      return res.status(400).json({ message: 'IDs array and status are required' });
    }

    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { status, updatedAt: Date.now() }
    );

    res.json({
      message: `Updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get low stock products
router.get('/admin/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .populate('category', 'name')
      .sort({ stock: 1 })
      .lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
