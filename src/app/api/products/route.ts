import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

// Inventory (GET)
export async function GET() {
  await connectToDatabase();
  const products = await Product.find({});
  return NextResponse.json(products);
}

// (POST)
export async function POST(request: Request) {
  await connectToDatabase();
  const data = await request.json();
  const newProduct = await Product.create(data);
  return NextResponse.json(newProduct);
}