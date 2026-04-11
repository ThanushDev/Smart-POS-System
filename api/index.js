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

const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' },
  whatsapp: String,
  businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number,
  discount: { type: Number, default: 0 } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, 
  items: Array, 
  total: Number, 
  discountTotal: { type: Number, default: 0 },
  paymentMethod: String, 
  cashier: String,
  businessId: String 
}, { timestamps: true }));


// --- API ROUTES ---

// 1. AUTHENTICATION (Login Fix - Roles properly sent)
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      // FIX: role සහ businessId හරියටම යැවීම
      res.json({ 
        success: true, 
        user: { 
          _id: user._id,
          name: user.name, 
          role: user.role, 
          email: user.email,
          businessId: user.businessId || user._id 
        } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. PRODUCTS (Full CRUD retained)
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

// 3. INVOICES (Safe mapping logic retained)
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
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
    const newInvoice = await Invoice.create(req.body);
    // Stock reduction logic retained
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    res.json({ success: true, message: "Invoice deleted from MongoDB" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
});

// 4. BUSINESS SETTINGS (Full Logic retained)
app.get('/api/business', async (req, res) => {
  await connectDB();
  try {
    const business = await Business.findOne();
    res.json(business || { name: "Digi Solutions", whatsapp: "" });
  } catch (err) {
    res.json({ name: "Digi Solutions", whatsapp: "" });
  }
});

app.put('/api/business/update', async (req, res) => {
  await connectDB();
  try {
    const updated = await Business.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, business: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 5. USER MANAGEMENT (Full Logic retained)
app.post('/api/users/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = await Business.create(req.body);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.get('/api/users', async (req, res) => {
  await connectDB();
  try {
    const users = await Business.find();
    res.json(users);
  } catch (err) {
    res.status(500).json([]);
  }
});

export default app;
