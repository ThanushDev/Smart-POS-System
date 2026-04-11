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
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
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

// --- API ROUTES ---

// 1. AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user: { name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) { res.status(500).json({ success: false }); }
});

// 2. INVENTORY ROUTES
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) { res.status(500).json({ success: false }); }
});

// *** DELETE PRODUCT ***
app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) { res.status(500).json({ success: false }); }
});

// 3. INVOICE ROUTES
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    // Stock deduction
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (error) { res.status(500).json({ success: false }); }
});

// *** DELETE INVOICE ***
app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Invoice deleted" });
  } catch (error) { res.status(500).json({ success: false }); }
});

// 4. DASHBOARD STATS
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
      todayBills: todayInvoices.length,
      lowStockCount: products.filter(p => p.qty <= 5).length,
      totalProducts: products.length
    });
  } catch (error) { res.status(500).json({ success: false }); }
});

// 5. BUSINESS DATA
app.get('/api/business', async (req, res) => {
  await connectDB();
  try {
    const business = await Business.findOne();
    res.json(business);
  } catch (error) { res.status(500).json({ success: false }); }
});

export default app;
