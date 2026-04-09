import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Invoice from '@/models/Invoice'; // ඔබේ Invoice Model එක මෙහිදී import කරන්න

// සියලුම Invoices ලබා ගැනීම (GET)
export async function GET() {
  await connectToDatabase();
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// Invoice එකක් මැකීම (DELETE)
export async function DELETE(request: Request) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}