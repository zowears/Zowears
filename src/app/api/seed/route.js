import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const initialProducts = [
  {
    id: "matsuri-tee",
    name: "Matsuri Oversized Tee",
    category: "embroidered",
    price: 1899,
    image: "/assets/001 (1).jpeg",
    description: "A heavyweight 240 GSM oversized tee with hand-finished kanji embroidery on the chest."
  },
  {
    id: "tsuki-hoodie",
    name: "Tsuki Oversized Hoodie",
    category: "hoodies",
    price: 3499,
    image: "/assets/001 (4).jpeg",
    description: "Heavyweight 420 GSM brushed-fleece hoodie with embroidered Tsuki crest."
  },
  {
    id: "ryujin-tee",
    name: "Ryujin Dragon Tee",
    category: "embroidered",
    price: 2199,
    image: "/assets/001 (7).jpeg",
    description: "Full-front Ryujin dragon embroidery in crimson thread."
  }
];

const initialOrders = [
  {
    customerName: "Alex Rivera",
    email: "alex@example.com",
    totalAmount: 5398,
    status: "delivered",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    items: [{ id: "matsuri-tee", quantity: 1 }, { id: "tsuki-hoodie", quantity: 1 }]
  },
  {
    customerName: "Sarah Chen",
    email: "sarah@example.com",
    totalAmount: 1899,
    status: "shipped",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [{ id: "matsuri-tee", quantity: 1 }]
  },
  {
    customerName: "Jordan Smith",
    email: "jordan@example.com",
    totalAmount: 2199,
    status: "pending",
    createdAt: new Date().toISOString(),
    items: [{ id: "ryujin-tee", quantity: 1 }]
  }
];

export async function GET() {
  try {
    // Clear existing
    // Seed products
    const existingProducts = db.products.getAll();
    if (existingProducts.length === 0) {
      initialProducts.forEach(p => db.products.create(p));
    }

    // Seed orders
    const existingOrders = db.orders.getAll();
    if (existingOrders.length === 0) {
      initialOrders.forEach(o => db.orders.create(o));
    }

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
