import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  slug: { 
    type: String, 
    unique: true, 
    sparse: true, 
    index: true 
  },
  description: { type: String },
  image: { type: String },
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-generate slug from name
categorySchema.pre('save', async function () {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

export default mongoose.model('Category', categorySchema);
