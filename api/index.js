import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

// Database Connection
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected Successfully");
  } catch (err) { 
    console.error("MongoDB Connection Error:", err); 
  }
};

// --- DATABASE MODELS ---

// Business Profile Model
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' },
  whatsapp: String
}));

// Product Model (Including Inventory Discount)
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number,
  discount: { type: Number, default: 0 } // Inventory එකෙන් දෙන % එක
}, { timestamps: true }));

// Invoice Model (Including Discount Total)
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, 
  items: Array, 
  total: Number, 
  discountTotal: { type: Number, default: 0 },
  paymentMethod: String, 
  cashier: String
}, { timestamps: true }));


// --- API ROUTES ---

// 1. AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user: { name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. PRODUCTS (INVENTORY)
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 3. INVOICES (SALES RECORDS)
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    // දත්ත පරීක්ෂා කර පද්ධතිය බිඳ නොවැටෙන ලෙස (Safe Mapping) යැවීම
    const safeInvoices = invoices.map(inv => ({
      _id: inv._id,
      invoiceId: inv.invoiceId || 'N/A',
      items: inv.items || [],
      total: inv.total || 0,
      discountTotal: inv.discountTotal || 0,
      paymentMethod: inv.paymentMethod || 'Cash',
      cashier: inv.cashier || 'Staff',
      createdAt: inv.createdAt
    }));
    res.json(safeInvoices);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load records" });
  }
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    // Invoice එක Save කිරීම
    const newInvoice = await Invoice.create(req.body);
    
    // බඩු විකුණූ පසු Inventory එකේ Qty අඩු කිරීම
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).json({ success: false });
  }
});

// 4. BUSINESS SETTINGS
app.get('/api/business', async (req, res) => {
  await connectDB();
  try {
    const business = await Business.findOne();
    res.json(business || { name: "Digi Solutions", whatsapp: "" });
  } catch (err) {
    res.json({ name: "Digi Solutions", whatsapp: "" });
  }
});

// Profile Update (WhatsApp Number එක වැනි දෑ වෙනස් කිරීමට)
app.put('/api/business/update', async (req, res) => {
  await connectDB();
  try {
    const updated = await Business.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, business: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default app;
