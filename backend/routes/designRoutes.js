import { Router } from 'express';
const router = Router();
import Design from '../models/Design.js';
import { upload } from '../config/cloudinary.js';

// Get all designs
router.get('/', async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search designs
router.get('/search', async (req, res) => {
  try {
    const queryStr = req.query.q || '';
    if (!queryStr.trim()) {
      return res.json([]);
    }

    const words = queryStr.toLowerCase().split(/\s+/).filter(Boolean);
    const designs = await Design.find();

    const scoredDesigns = designs.map(design => {
      let score = 0;
      const name = (design.name || '').toLowerCase();
      const desc = (design.description || '').toLowerCase();
      const cat = (design.category || '').toLowerCase();
      const designType = (design.designType || '').toLowerCase();

      words.forEach(word => {
        if (name === word) score += 15;
        else if (name.includes(word)) score += 10;
        if (cat.includes(word)) score += 6;
        if (designType.includes(word)) score += 4;
        if (desc.includes(word)) score += 3;
      });

      return { design, score };
    });

    const results = scoredDesigns
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.design);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single design
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json(design);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create design with 2 image uploads
router.post('/', upload.array('images', 2), async (req, res) => {
  try {
    const {
      name, description, price, stitchCount, totalColors,
      size, designType, threadType, fabricType, formats,
      driveLink, category, isFeatured
    } = req.body;

    const imageUrls = req.files ? req.files.map(f => f.path) : [];

    const design = new Design({
      name,
      description,
      price: Number(price) || 1,
      image1: imageUrls[0] || '',
      image2: imageUrls[1] || imageUrls[0] || '',
      stitchCount: Number(stitchCount) || 0,
      totalColors: Number(totalColors) || 0,
      size: size || '',
      designType: designType || 'Flat',
      threadType: threadType || 'Polyester',
      fabricType: fabricType || 'All Fabrics',
      formats: formats ? (typeof formats === 'string' ? JSON.parse(formats) : formats) : ['DST', 'PES', 'JEF', 'XXX', 'VP3', 'HUS', 'EXP'],
      driveLink: driveLink || '',
      category: category || 'General',
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    const newDesign = await design.save();
    res.status(201).json(newDesign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update design
router.patch('/:id', async (req, res) => {
  try {
    const design = await Design.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(design);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete design
router.delete('/:id', async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.json({ message: 'Design deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
