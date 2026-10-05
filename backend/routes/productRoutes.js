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
    
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    } else if (!req.query.status) {
      query.status = 'active';
    }
    
    // Filter by categories (supports multiple comma-separated categories)
    if (req.query.categories) {
      const cats = req.query.categories.split(',');
      query.categories = { $in: cats };
    }

    // Filter by productType
    if (req.query.productType) {
      query.productType = req.query.productType;
    }

    // Filter by isKidsWear
    if (req.query.isKidsWear !== undefined) {
      query.isKidsWear = req.query.isKidsWear === 'true';
    }

    // Exclude kids products (for Shop All)
    // Uses $nor to prevent overwriting other category filters and to correctly
    // exclude any document where isKidsWear=true, productType='kids', or categories contains 'Kids Wear'
    if (req.query.excludeKids === 'true') {
      query.$nor = [
        { isKidsWear: true },
        { productType: 'kids' },
        { categories: 'Kids Wear' }
      ];
      // Remove individual keys that may conflict
      delete query.isKidsWear;
      delete query.productType;
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
      Product.aggregate([
        { $match: query },
        {
          $addFields: {
            sortRank: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$rank", null] },
                    { $gt: ["$rank", 0] },
                    { $lte: ["$rank", 10] }
                  ]
                },
                then: "$rank",
                else: 999999
              }
            }
          }
        },
        { $sort: { sortRank: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { sortRank: 0, __v: 0 } }
      ]),
      Product.countDocuments(query)
    ]);

    const formattedProducts = products.map(p => ({
      ...p,
      id: p._id.toString()
    }));

    res.json({
      data: formattedProducts,
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

// Create product with full details
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      description,
      categories,
      productType,
      isKidsWear,
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
      fits,
      jp,
      badge
    } = req.body;

    const isKids = productType === 'kids' || isKidsWear === 'true' || isKidsWear === true;

    if (isKids) {
      if (!name || !price) {
        return res.status(400).json({
          message: 'Name and price are required for Kids Wear products'
        });
      }
    } else {
      if (!name || !categories || !price) {
        return res.status(400).json({
          message: 'Name, categories, and price are required'
        });
      }
    }

    let parsedCategories = [];
    if (categories) {
      try {
        parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (e) {
        parsedCategories = Array.isArray(categories) ? categories : [];
      }
    }
    if (isKids && (!parsedCategories || parsedCategories.length === 0)) {
      parsedCategories = ['Kids Wear'];
    }

    // Process images
    const images = req.files ? req.files.map((f, idx) => ({
      url: f.path,
      isPrimary: idx === 0
    })) : [];

    const primaryImage = images.length > 0 ? images[0].url : '';

    // Parse colors (if sent as JSON string)
    let parsedColors = [];
    if (!isKids && colors) {
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

    let parsedFits = [];
    if (!isKids && fits) {
      try {
        parsedFits = typeof fits === 'string' ? JSON.parse(fits) : fits;
      } catch (e) {
        parsedFits = Array.isArray(fits) ? fits : [];
      }
    }

    const product = new Product({
      name,
      description,
      categories: parsedCategories,
      productType: isKids ? 'kids' : (productType || 'apparel'),
      isKidsWear: isKids,
      brand: brand || 'Zowears',
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
      fits: parsedFits,
      images,
      image: primaryImage,
      jp,
      badge
    });

    const newProduct = await product.save();
    
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
      description,
      categories,
      productType,
      isKidsWear,
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
      fits,
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
    if (productType !== undefined) product.productType = productType;
    if (isKidsWear !== undefined) product.isKidsWear = isKidsWear === 'true' || isKidsWear === true;
    if (description !== undefined) product.description = description;
    if (categories !== undefined) {
      try {
        product.categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (e) {
        product.categories = Array.isArray(categories) ? categories : [];
      }
    }
    if (brand !== undefined) product.brand = brand;
    if (status) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (jp !== undefined) product.jp = jp;
    if (badge !== undefined) product.badge = badge;

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

    if (fits) {
      try {
        product.fits = typeof fits === 'string' ? JSON.parse(fits) : fits;
      } catch (e) {
        product.fits = Array.isArray(fits) ? fits : [];
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

// Update product rank (1-10 or null)
router.patch('/:id/rank', auth, async (req, res) => {
  try {
    const { rank } = req.body;
    let targetRank = null;

    if (rank !== null && rank !== undefined && rank !== '' && rank !== 'none' && rank !== 'None') {
      const parsedRank = parseInt(rank, 10);
      if (isNaN(parsedRank) || parsedRank < 1 || parsedRank > 10) {
        return res.status(400).json({ message: 'Rank must be a number between 1 and 10 or null' });
      }
      targetRank = parsedRank;
    }

    const productId = req.params.id;

    // If setting a rank (1-10), remove that rank from any other product currently holding it
    if (targetRank !== null) {
      await Product.updateMany(
        { _id: { $ne: productId }, rank: targetRank },
        { $set: { rank: null } }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: { rank: targetRank } },
      { new: true }
    ).select('-__v');

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
