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
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number,
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, paymentMethod: String, cashier: String
}, { timestamps: true }));

// --- ROUTES ---

// Login - මෙන්න මෙතැනයි වැරැද්ද සිද්ධ වුණේ. දැන් මෙය නිවැරදි කර ඇත.
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    // username යනු email එක බව සහතික කරගන්න
    const user = await Business.findOne({ email: username, password: password });
    
    if (user) {
      res.json({ 
        success: true, 
        user: { name: user.name, role: user.role, email: user.email } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) { 
    res.status(500).json({ success: false, message: "Server error" }); 
  }
});

// Products
app.get('/api/products', async (req, res) => {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  const newProduct = await Product.create(req.body);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: updated });
  } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  res.json(invoices);
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    // Stock එක අඩු කරන logic එක
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

// Business Profile
app.get('/api/business', async (req, res) => {
  await connectDB();
  try {
    const business = await Business.findOne();
    res.json(business || { name: "Digi Solutions" });
  } catch (error) { res.json({ name: "Digi Solutions" }); }
});

export default app;
