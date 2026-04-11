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
  } catch (err) { 
    console.error("MongoDB Connection Error:", err); 
  }
};

// --- DATABASE MODELS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }, whatsapp: String, businessId: String, address: String, logo: String
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, discountTotal: { type: Number, default: 0 },
  paymentMethod: String, cashier: String, businessId: String 
}, { timestamps: true }));

// --- API ROUTES ---

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user: { _id: user._id, name: user.name, role: user.role, email: user.email, businessId: user.businessId || user._id } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) { res.status(500).json({ success: false }); }
});

// Products CRUD
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
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, product: updated });
});

// DELETE WITH ADMIN CHECK
app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  if (req.headers['user-role'] !== 'Admin') return res.status(403).json({ success: false, message: "Admin Only" });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Invoices CRUD
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  res.json(invoices);
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  const newInvoice = await Invoice.create(req.body);
  for (const item of req.body.items) {
    await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
  }
  res.status(201).json(newInvoice);
});

// DELETE WITH ADMIN CHECK
app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  if (req.headers['user-role'] !== 'Admin') return res.status(403).json({ success: false, message: "Admin Only" });
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Business Info
app.get('/api/business', async (req, res) => {
  await connectDB();
  const business = await Business.findOne({ role: 'Admin' });
  res.json(business || { name: "Digi Solutions" });
});

export default app;
