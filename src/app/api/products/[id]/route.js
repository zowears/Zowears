import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db.js';
import Product from '../../../../backend/models/Product.js';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    await connectDB();
    const productDoc = await Product.findById(id).populate('category', 'name slug').lean();
    if (!productDoc) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const product = {
      ...productDoc,
      id: productDoc._id.toString(),
      image: productDoc.image || (productDoc.images?.[0]?.url) || '',
      category: productDoc.category?.slug || productDoc.category?.name,
      colors: productDoc.colors?.map(c => ({ ...c, hex: c.hexCode })) || []
    };
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const updatedProduct = db.products.update(id, body);
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    db.products.delete(id);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
