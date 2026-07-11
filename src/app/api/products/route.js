import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db.js';
import Product from '../../../../backend/models/Product.js';

export async function GET() {
  try {
    await connectDB();
    const rawProducts = await Product.find({ status: 'active' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    const products = rawProducts.map(p => ({
      ...p,
      id: p._id.toString(),
      image: p.image || (p.images?.[0]?.url) || '',
      category: p.category?.slug || p.category?.name,
      colors: p.colors?.map(c => ({ ...c, hex: c.hexCode })) || []
    }));
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const created = await Product.create(body);
    await created.populate('category', 'name slug');
    const product = {
      ...created.toObject(),
      id: created._id.toString(),
      image: created.image || (created.images?.[0]?.url) || '',
      category: created.category?.slug || created.category?.name,
      colors: created.colors?.map(c => ({ ...c, hex: c.hexCode })) || []
    };
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
