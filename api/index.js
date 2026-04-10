import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
  } catch (err) { console.error("DB Error:", err); }
};

// --- MODELS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String, required: true }, role: { type: String, default: 'Admin' }
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number,
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, paymentMethod: String, cashier: String
}, { timestamps: true }));

// --- API ROUTES (Router එකක් නැතිව කෙලින්ම App එකට) ---

app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { businessName, email, password } = req.body;
    const newBusiness = await Business.create({ name: businessName, email, password });
    res.status(201).json({ success: true, user: newBusiness });
  } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    // ඔබේ Frontend එකෙන් username/password එවන්නේ නම්:
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user: { name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Login failed" });
    }
  } catch (error) { res.status(500).json({ success: false }); }
});

app.get('/api/products', async (req, res) => {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (error) { res.status(500).json({ success: false }); }
});

app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [invoices, products] = await Promise.all([
      Invoice.find({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } }),
      Product.find()
    ]);
    const todayInvoices = invoices.filter(inv => new Date(inv.createdAt) >= startOfToday);
    res.json({
      todayIncome: todayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      todayCash: todayInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((sum, inv) => sum + inv.total, 0),
      todayCard: todayInvoices.filter(inv => inv.paymentMethod === 'Card').reduce((sum, inv) => sum + inv.total, 0),
      monthIncome: invoices.reduce((sum, inv) => sum + inv.total, 0),
      todayBills: todayInvoices.length,
      lowStockCount: products.filter(p => p.qty <= 5).length,
      lowStockItems: products.filter(p => p.qty <= 5),
      totalProducts: products.length,
      totalStockValue: products.reduce((sum, p) => sum + (p.price * p.qty), 0)
    });
  } catch (error) { res.status(500).json({ success: false }); }
});

app.get('/api/business', async (req, res) => {
  await connectDB();
  const business = await Business.findOne();
  res.json(business);
});

// Default status
app.get('/api', (req, res) => res.send("Digi Solutions API is running..."));

export default app;
