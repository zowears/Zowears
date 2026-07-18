import { Router } from 'express';
import Visit from '../models/Visit.js';
import Product from '../models/Product.js';

const router = Router();

// Record a unique site visit
router.post('/visit', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Find if IP already exists
    let visit = await Visit.findOne({ ip });

    if (visit) {
      // Update last visit time if it exists
      visit.lastVisit = Date.now();
      visit.userAgent = userAgent;
      await visit.save();
    } else {
      // Create new visit record
      visit = new Visit({
        ip,
        userAgent
      });
      await visit.save();
    }

    res.status(200).json({ success: true, message: 'Visit recorded' });
  } catch (error) {
    console.error('Visit tracking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Increment product view
router.post('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // We update the view count without triggering validators
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    res.status(200).json({ success: true, message: 'Product view incremented' });
  } catch (error) {
    console.error('Product view tracking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
