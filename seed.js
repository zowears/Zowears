import { products } from './src/lib/products.js';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const productsPath = path.join(DATA_DIR, 'products.json');

// We need to handle the image imports which are not serializable to JSON
// We'll replace them with placeholder paths or just skip them for now, 
// but since they are imported, we can't easily run this in a standalone script without bundling.
// I'll just manually create the initial products.json with some data.

const initialProducts = products.map(p => ({
  ...p,
  image: typeof p.image === 'string' ? p.image : `/assets/${p.id}.jpg`, // placeholder
  images: p.images.map((img, i) => typeof img === 'string' ? img : `/assets/${p.id}-${i}.jpg`)
}));

fs.writeFileSync(productsPath, JSON.stringify(initialProducts, null, 2));
console.log('Seeded products.json');
