import { connect } from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // One-time self-healing migration to add slugs to existing products lacking one
    const productsWithoutSlugs = await Product.find({ 
      $or: [
        { slug: { $exists: false } }, 
        { slug: "" }, 
        { slug: null }
      ] 
    });
    
    if (productsWithoutSlugs.length > 0) {
      console.log(`[Migration] Found ${productsWithoutSlugs.length} products without slugs. Migrating...`);
      for (const product of productsWithoutSlugs) {
        let baseSlug = product.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
          
        if (!baseSlug) {
          baseSlug = 'product';
        }
        
        // Handle slug uniqueness
        let uniqueSlug = baseSlug;
        let count = 1;
        while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: product._id } })) {
          uniqueSlug = `${baseSlug}-${count}`;
          count++;
        }
        
        product.slug = uniqueSlug;
        await product.save();
        console.log(`[Migration] Assigned slug "${uniqueSlug}" to product "${product.name}"`);
      }
      console.log('[Migration] Database migration complete.');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
