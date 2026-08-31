import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
dotenv.config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let migrationCompleted = false;

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection failed:', error);
    throw error;
  }

  // Non-blocking background migration check
  if (!migrationCompleted) {
    migrationCompleted = true;
    runMigrations().catch(err => console.error('Migration error:', err));
  }

  return cached.conn;
};

async function runMigrations() {
  try {
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
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
}

export default connectDB;
