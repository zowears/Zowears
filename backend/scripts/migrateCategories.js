import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zowears'; // fallback

mongoose.connect(mongoURI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function migrate() {
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate.`);
    let migratedCount = 0;
    
    for (const product of products) {
      let doc = product.toObject();
      let newCategories = [];
      let isAmbiguous = false;
      
      const oldMain = doc.mainCategory;
      const oldSub = doc.subCategory;

      if (oldMain === 'Designs') {
        newCategories.push('Designs');
      } else if (oldMain === 'Plain Tees') {
        newCategories.push('Plain Tee & Hoodies');
        if (oldSub === 'T-shirts') newCategories.push('T-Shirts');
        else if (oldSub === 'Hoodies') newCategories.push('Hoodies');
        else if (oldSub) newCategories.push(oldSub);
      } else {
        if (oldSub === 'T-shirts') newCategories.push('T-Shirts');
        else if (oldSub === 'Hoodies') newCategories.push('Hoodies');
        else if (oldSub === 'Zipper Hoodies') newCategories.push('Zipper Hoodies');
        else if (oldSub === 'Sweatshirts') newCategories.push('Sweatshirts');
        else if (oldSub === 'Denim Jackets') newCategories.push('Denim Jackets');
        else if (oldSub) newCategories.push(oldSub); 
        
        if (oldMain === 'Girls Wear') {
          newCategories.push('Special for Girls');
        } else if (oldMain === "Men's Wear") {
          isAmbiguous = true;
        }
      }

      if (newCategories.length === 0) {
        if (oldMain) newCategories.push(oldMain);
      }

      newCategories = [...new Set(newCategories)];

      const updateOp = {
        $set: { categories: newCategories },
        $unset: { mainCategory: "", subCategory: "" }
      };

      if (isAmbiguous) {
        console.log(`[AMBIGUOUS] Product "${doc.name}" (ID: ${doc._id}) was "Men's Wear" / "${oldSub}". Migrated to: [${newCategories.join(', ')}]`);
      }

      await Product.updateOne({ _id: doc._id }, updateOp);
      migratedCount++;
    }

    console.log(`Migration complete. Updated ${migratedCount} products.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrate();
