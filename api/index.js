import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection Logic
const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("Digi Solutions DB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

// --- MODELS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String,
  whatsapp: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  logo: String,
  role: { type: String, default: 'Admin' }
}, { timestamps: true }));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String,
  code: String,
  price: Number,
  qty: Number,
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String,
  items: Array,
  total: Number,
  paymentMethod: String,
  cashier: String
}, { timestamps: true }));

// --- ROUTER SETUP ---
const router = express.Router();

// 1. Auth Routes
router.post('/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { businessName, whatsapp, email, password, logo } = req.body;
    const existingUser = await Business.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

    const newBusiness = await Business.create({ name: businessName, whatsapp, email, password, logo });
    res.status(201).json({ success: true, user: newBusiness });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body; // username ලෙස එන්නේ email එකයි
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user: { name: user.name, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2. Inventory Routes
router.get('/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ success: false }); }
});

router.post('/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) { res.status(500).json({ success: false }); }
});

// 3. Invoice Routes
router.post('/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (error) { res.status(500).json({ success: false }); }
});

// 4. Dashboard Stats Route (අත්‍යවශ්‍යයි)
router.get('/dashboard/stats', async (req, res) => {
  await connectDB();
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [invoices, products] = await Promise.all([
      Invoice.find({ createdAt: { $gte: startOfMonth } }),
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

router.get('/business', async (req, res) => {
  await connectDB();
  const business = await Business.findOne();
  res.json(business);
});

// සියලුම Router දත්ත '/api' යටතට පත් කිරීම
app.use('/api', router);

// Default API status
app.get('/api', (req, res) => {
  res.send("Digi Solutions API is running...");
});

export default app;
