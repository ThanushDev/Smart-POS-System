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
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';

export async function GET() {
  await connectToDatabase();
  
  try {
    const now = new Date();
    // අද දවසේ ආරම්භය (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // මෙම මාසයේ ආරම්භය
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Today Stats (අද දින දත්ත)
    const todayInvoices = await Invoice.find({ createdAt: { $gte: startOfToday } });
    const todayIncome = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // 2. Month Stats (මාසික දත්ත)
    const monthInvoices = await Invoice.find({ createdAt: { $gte: startOfMonth } });
    const monthIncome = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // 3. Product & Inventory Stats (තොග දත්ත)
    const allProducts = await Product.find({});
    const lowStockItems = allProducts.filter(p => p.qty <= 5);
    
    // මුළු තොගයේ මුල්‍යමය වටිනාකම (Total Inventory Value)
    const totalStockValue = allProducts.reduce((sum, p) => sum + (p.price * p.qty), 0);

    return NextResponse.json({
      // බිල්පත් ගණන
      todayBills: todayInvoices.length,
      monthBills: monthInvoices.length,
      
      // ආදායම් දත්ත
      todayIncome: todayIncome,
      monthIncome: monthIncome,
      
      // තොග දත්ත
      totalProducts: allProducts.length,
      lowStockCount: lowStockItems.length,
      totalStockValue: totalStockValue,
      
      // Dashboard එකේ ලිස්ට් එකක් පෙන්වීමට අවශ්‍ය නම්
      lowStockItems: lowStockItems 
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Stats calculation failed" }, { status: 500 });
  }
}
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
