import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  await connectToDatabase();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const product = await Product.create(data);
  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await connectToDatabase();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "Product Deleted" });
}
