import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) { console.error("DB Error:", err); }
};

// --- SCHEMAS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String }, 
  role: { type: String, default: 'Admin' }, businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, 
  discount: { type: Number, default: 0 }, businessId: String 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, cashier: String, date: String, businessId: String
}, { timestamps: true }));

// --- ROUTES ---

// Login Fix
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    const user = await Business.findOne({ email: username, password: password });
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: "Invalid Credentials" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  res.json(await Product.find({ businessId: bid }).sort({ createdAt: -1 }));
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  const inv = new Invoice(req.body);
  await inv.save();
  for (let item of req.body.items) {
    await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.cartQty } });
  }
  res.json(inv);
});

// Test Route
app.get('/api/test', (req, res) => res.json({ status: "API is Running" }));

export default app;
