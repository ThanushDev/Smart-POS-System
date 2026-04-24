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
  } catch (err) { console.error("MongoDB Connection Error:", err); }
};

// --- MODELS ---
// Business Model එකට address සහ logo එකත් ඇතුළත් කළා
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }, 
  whatsapp: String, 
  address: String,
  logo: String,
  businessId: String
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, discountTotal: Number, cashier: String, date: String, time: String
}, { timestamps: true }));

// --- AUTH ROUTES ---

// 1. REGISTER (මේක තමයි අලුතින්ම එකතු කළේ)
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { email } = req.body;
    const existing = await Business.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    const newUser = await Business.create(req.body);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed: " + err.message });
  }
});

// 2. LOGIN (Username/Email mismatch එක මෙතනින් fix කළා)
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body; 
    // Frontend එකෙන් එන 'username' කියන එක Backend එකේ 'email' එකට match කරනවා
    const user = await Business.findOne({ email: username, password: password });
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Login Error" });
  }
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  await connectDB();
  res.json(await Product.find());
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

// --- INVOICE ROUTES ---
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  res.json(await Invoice.find().sort({ createdAt: -1 }));
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    // Stock එක අඩු කිරීම
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (err) { res.status(500).json({ success: false }); }
});

export default app;
