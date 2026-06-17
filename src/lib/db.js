import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${collection}:`, error);
  }
};

export const db = {
  products: {
    getAll: () => readData('products'),
    getById: (id) => readData('products').find(p => p.id === id),
    create: (product) => {
      const products = readData('products');
      const newProduct = { ...product, id: product.id || Date.now().toString() };
      products.push(newProduct);
      writeData('products', products);
      return newProduct;
    },
    update: (id, updates) => {
      const products = readData('products');
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        writeData('products', products);
        return products[index];
      }
      return null;
    },
    delete: (id) => {
      const products = readData('products');
      const filtered = products.filter(p => p.id !== id);
      writeData('products', filtered);
      return true;
    }
  },
  orders: {
    getAll: () => readData('orders'),
    getById: (id) => readData('orders').find(o => o.id === id),
    create: (order) => {
      const orders = readData('orders');
      const newOrder = { 
        ...order, 
        id: `ORD-${Date.now()}`, 
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      orders.push(newOrder);
      writeData('orders', orders);
      return newOrder;
    },
    update: (id, updates) => {
      const orders = readData('orders');
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        writeData('orders', orders);
        return orders[index];
      }
      return null;
    }
  }
};
