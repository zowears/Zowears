import { Router } from 'express';
import Color from '../models/Color.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all colors
router.get('/', async (req, res) => {
  try {
    const colors = await Color.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all colors (including inactive) - Admin only
router.get('/admin/all', auth, async (req, res) => {
  try {
    const colors = await Color.find()
      .sort({ name: 1 })
      .lean();
    res.json({
      data: colors,
      total: colors.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create color - Admin only
router.post('/', auth, async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    
    if (!name || !hexCode) {
      return res.status(400).json({ message: 'Color name and hex code are required' });
    }
    
    const existingColor = await Color.findOne({ name });
    if (existingColor) {
      return res.status(400).json({ message: 'Color already exists' });
    }
    
    const color = new Color({ name, hexCode });
    const savedColor = await color.save();
    res.status(201).json(savedColor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update color - Admin only
router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, hexCode, isActive } = req.body;
    
    const color = await Color.findByIdAndUpdate(
      req.params.id,
      { name, hexCode, isActive },
      { new: true }
    );
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    res.json(color);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete color - Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
