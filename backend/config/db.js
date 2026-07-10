import { connect } from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
dotenv.config();

let migrationCompleted = false;

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Only run migration/seeding once per process (not on every restart in development)
    if (!migrationCompleted) {
      // Seed default categories if none exist
      const categoryCount = await Category.countDocuments();
      if (categoryCount === 0) {
        console.log('[Seed] Seeding default categories...');
        const defaultCategories = [
          { name: 'T-shirts', slug: 't-shirts', description: 'Premium T-shirts' },
          { name: 'Hoodies', slug: 'hoodies', description: 'Heavyweight Hoodies' },
          { name: 'Sweatshirts', slug: 'sweatshirts', description: 'Premium Sweatshirts' },
          { name: 'Plain Tees', slug: 'plain-tees', description: 'Plain Tees & Essentials' }
        ];
        await Category.insertMany(defaultCategories);
        console.log('[Seed] Default categories seeded successfully.');
      }

      // One-time self-healing migration to add slugs to existing products lacking one
      const productsWithoutSlugs = await Product.find({ 
        $or: [
          { slug: { $exists: false } }, 
          { slug: "" }, 
          { slug: null }
        ] 
      }).limit(100).lean();
      
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
          
          await Product.updateOne(
            { _id: product._id },
            { slug: uniqueSlug }
          );
          console.log(`[Migration] Assigned slug "${uniqueSlug}" to product "${product.name}"`);
        }
        console.log('[Migration] Database migration complete.');
      }
      migrationCompleted = true;
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
