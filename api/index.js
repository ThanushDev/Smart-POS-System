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

// --- MODELS (Data Isolation Feature Added) ---

// Hama Business ekatama unique ID ekak thiyenawa (MongoDB _id)
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }, 
  whatsapp: String,
  address: String,
  logo: String
}));

// Products walata businessId field eka ekathu kara
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  discount: { type: Number, default: 0 },
  businessId: { type: String, required: true } 
}, { timestamps: true }));

// Invoices walata businessId field eka ekathu kara
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, 
  items: Array, 
  total: Number, 
  discountTotal: Number, 
  cashier: String,
  date: String,
  time: String,
  businessId: { type: String, required: true }
}, { timestamps: true }));

// --- ROUTES ---

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = new Business(req.body);
    await newUser.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  const user = await Business.findOne({ email: username, password: password });
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: "Invalid Credentials" });
  }
});

// 2. Products (Business ID eka anuwa filter wenawa)
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.headers['business-id']; 
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Product.find({ businessId: bid }));
});

app.post('/api/products/add', async (req, res) => {
  await connectDB();
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

// 3. Invoices (Business ID eka anuwa filter wenawa)
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const bid = req.headers['business-id'];
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Invoice.find({ businessId: bid }).sort({ createdAt: -1 }));
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    // Stock Update Logic
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

// 4. Users/Staff Management (Admin ta pamanai)
app.get('/api/users', async (req, res) => {
  await connectDB();
  res.json(await Business.find());
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
