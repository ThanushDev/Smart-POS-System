import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';

export async function GET() {
  await connectToDatabase();
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today Stats
    const todayInvoices = await Invoice.find({ createdAt: { $gte: startOfToday } });
    const todayIncome = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Month Stats
    const monthInvoices = await Invoice.find({ createdAt: { $gte: startOfMonth } });
    const monthIncome = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Product Stats
    const allProducts = await Product.find({});
    const lowStockCount = allProducts.filter(p => p.qty <= 5).length;

    return NextResponse.json({
      todayBills: todayInvoices.length,
      monthBills: monthInvoices.length,
      todayIncome: todayIncome,
      monthIncome: monthIncome,
      totalProducts: allProducts.length,
      lowStockCount: lowStockCount
    });
  } catch (error) {
    return NextResponse.json({ error: "Stats calculation failed" }, { status: 500 });
  }
}