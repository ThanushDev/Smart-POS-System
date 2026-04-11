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
    console.log("MongoDB Connected Successfully");
  } catch (err) { console.error("DB Error:", err); }
};

// --- SCHEMAS (ඔයාගේ පරණ දත්ත වලට ගැලපෙන ලෙස) ---

const BusinessSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Staff' },
  businessId: String
});
const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

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
  discountTotal: Number,
  paymentMethod: String,
  cashier: String,
  businessId: String
}, { timestamps: true }));

// --- API ROUTES ---

// LOGIN FIX: Email හෝ Name දෙකෙන්ම Login විය හැක
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ 
      $or: [{ email: username }, { name: username }], 
      password: password 
    });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) { res.status(500).json({ success: false }); }
});

// USERS FETCH & DELETE
app.get('/api/users', async (req, res) => {
  await connectDB();
  try {
    const users = await Business.find();
    res.json(users);
  } catch (err) { res.status(500).json([]); }
});

app.delete('/api/users/:id', async (req, res) => {
  await connectDB();
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) { res.status(500).json({ success: false }); }
});

// FULL SHOP RESET (ADMIN PASSWORD ONLY)
app.post('/api/admin/reset-all', async (req, res) => {
  await connectDB();
  const { adminPassword } = req.body;
  try {
    const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
    if (!admin) return res.status(403).json({ success: false, message: "Incorrect Admin Password!" });
    
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    res.json({ success: true, message: "All Data Reset Successfully" });
  } catch (err) { res.status(500).json({ success: false }); }
});

// PRODUCTS SYNC FIX
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProd = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProd });
  } catch (err) { res.status(500).json({ success: false }); }
});

// INVOICES SYNC FIX
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInv = await Invoice.create(req.body);
    // Stock auto-reduction logic (FEATURE RETAINED)
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInv);
  } catch (err) { res.status(500).json({ success: false }); }
});

export default app;
