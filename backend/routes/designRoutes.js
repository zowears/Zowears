import { Router } from 'express';
import mongoose from 'mongoose';
import Design from '../models/Design.js';
import { cloudinary } from '../config/cloudinary.js';

const router = Router();

// Helper to extract Cloudinary public ID from secure URL
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    let pathParts = parts.slice(uploadIndex + 1);
    // Remove version segment (e.g. v12345678)
    if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
      pathParts = pathParts.slice(1);
    }
    
    const publicIdWithExt = pathParts.join('/');
    const dotIndex = publicIdWithExt.lastIndexOf('.');
    return dotIndex !== -1 ? publicIdWithExt.substring(0, dotIndex) : publicIdWithExt;
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
}

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

// Get Cloudinary upload signature
router.post('/upload-signature', async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folderName = 'zowears_designs';
    
    const paramsToSign = {
      timestamp: timestamp,
      folder: folderName,
    };
    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: folderName,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate upload signature', error: error.message });
  }
});

// Create design
router.post('/', async (req, res) => {
  try {
    const {
      name, description, price, stitchCount, totalColors,
      size, designType, threadType, fabricType, formats,
      driveLink, category, isFeatured, status, tags, image1, image2
    } = req.body;

    // Backend validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Design name is required' });
    }
    if (!image1 || typeof image1 !== 'string' || !image1.trim()) {
      return res.status(400).json({ message: 'Design image 1 is required' });
    }
    if (!image2 || typeof image2 !== 'string' || !image2.trim()) {
      return res.status(400).json({ message: 'Design image 2 is required' });
    }
    if (stitchCount === undefined || stitchCount === null || isNaN(stitchCount) || Number(stitchCount) < 0) {
      return res.status(400).json({ message: 'Valid stitch count is required' });
    }
    if (totalColors === undefined || totalColors === null || isNaN(totalColors) || Number(totalColors) < 0) {
      return res.status(400).json({ message: 'Valid color count is required' });
    }
    if (!size || typeof size !== 'string' || !size.trim()) {
      return res.status(400).json({ message: 'Design size is required' });
    }
    if (!driveLink || typeof driveLink !== 'string' || !driveLink.trim()) {
      return res.status(400).json({ message: 'Google Drive download link is required' });
    }

    const design = new Design({
      name: name.trim(),
      description: description?.trim() || '',
      price: Number(price) || 1,
      image1: image1.trim(),
      image2: image2.trim(),
      stitchCount: Number(stitchCount),
      totalColors: Number(totalColors),
      size: size.trim(),
      designType: designType || 'Flat',
      threadType: threadType || 'Polyester',
      fabricType: fabricType || 'All Fabrics',
      formats: formats || ['DST', 'PES', 'JEF', 'XXX', 'VP3', 'HUS', 'EXP'],
      driveLink: driveLink.trim(),
      category: category || 'General',
      isFeatured: isFeatured === true,
      status: status || 'Active',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    const newDesign = await design.save();
    res.status(201).json(newDesign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update design
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid design ID format' });
  }

  try {
    const existingDesign = await Design.findById(id);
    if (!existingDesign) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const {
      name, description, price, stitchCount, totalColors,
      size, designType, threadType, fabricType, formats,
      driveLink, category, isFeatured, status, tags, image1, image2
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Design name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) updateData.description = description?.trim() || '';
    
    if (price !== undefined) {
      updateData.price = Number(price) || 1;
    }

    if (stitchCount !== undefined) {
      if (isNaN(stitchCount) || Number(stitchCount) < 0) {
        return res.status(400).json({ message: 'Valid stitch count is required' });
      }
      updateData.stitchCount = Number(stitchCount);
    }

    if (totalColors !== undefined) {
      if (isNaN(totalColors) || Number(totalColors) < 0) {
        return res.status(400).json({ message: 'Valid color count is required' });
      }
      updateData.totalColors = Number(totalColors);
    }

    if (size !== undefined) {
      if (typeof size !== 'string' || !size.trim()) {
        return res.status(400).json({ message: 'Design size cannot be empty' });
      }
      updateData.size = size.trim();
    }

    if (designType !== undefined) updateData.designType = designType;
    if (threadType !== undefined) updateData.threadType = threadType;
    if (fabricType !== undefined) updateData.fabricType = fabricType;
    if (formats !== undefined) updateData.formats = formats;
    
    if (driveLink !== undefined) {
      if (typeof driveLink !== 'string' || !driveLink.trim()) {
        return res.status(400).json({ message: 'Google Drive download link cannot be empty' });
      }
      updateData.driveLink = driveLink.trim();
    }

    if (category !== undefined) updateData.category = category;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (status !== undefined) {
      if (!['Active', 'Draft'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Must be Active or Draft' });
      }
      updateData.status = status;
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    // Keep track of old image URLs to delete from Cloudinary if successfully updated and URLs changed
    let oldImage1ToDestroy = null;
    let oldImage2ToDestroy = null;

    if (image1 !== undefined) {
      if (!image1 || typeof image1 !== 'string' || !image1.trim()) {
        return res.status(400).json({ message: 'Design image 1 is required' });
      }
      if (image1 !== existingDesign.image1) {
        oldImage1ToDestroy = existingDesign.image1;
        updateData.image1 = image1;
      }
    }

    if (image2 !== undefined) {
      if (!image2 || typeof image2 !== 'string' || !image2.trim()) {
        return res.status(400).json({ message: 'Design image 2 is required' });
      }
      if (image2 !== existingDesign.image2) {
        oldImage2ToDestroy = existingDesign.image2;
        updateData.image2 = image2;
      }
    }

    const updatedDesign = await Design.findByIdAndUpdate(id, updateData, { new: true });

    // Clean up replaced images from Cloudinary asynchronously (do not block the response)
    if (oldImage1ToDestroy) {
      const publicId = getPublicIdFromUrl(oldImage1ToDestroy);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error(`Failed to delete old image1 (${publicId}) from Cloudinary:`, err);
        });
      }
    }

    if (oldImage2ToDestroy) {
      const publicId = getPublicIdFromUrl(oldImage2ToDestroy);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error(`Failed to delete old image2 (${publicId}) from Cloudinary:`, err);
        });
      }
    }

    res.json(updatedDesign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete design
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid design ID format' });
  }

  try {
    const design = await Design.findById(id);
    if (!design) return res.status(404).json({ message: 'Design not found' });

    await Design.findByIdAndDelete(id);

    // Clean up Cloudinary assets
    if (design.image1) {
      const publicId = getPublicIdFromUrl(design.image1);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error(`Failed to delete image1 (${publicId}) from Cloudinary:`, err);
        });
      }
    }
    if (design.image2) {
      const publicId = getPublicIdFromUrl(design.image2);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch(err => {
          console.error(`Failed to delete image2 (${publicId}) from Cloudinary:`, err);
        });
      }
    }

    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
