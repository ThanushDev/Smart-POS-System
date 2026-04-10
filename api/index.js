import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection Logic for Serverless (Vercel)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in Environment Variables");
}

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


// --- API ROUTES ---

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
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

// 2. Inventory / Products Routes
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading products" });
  }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const { name, code, price, qty } = req.body;
    const newProduct = await Product.create({ 
      name, 
      code, 
      price: Number(price), 
      qty: Number(qty) 
    });
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/products', async (req, res) => {
  await connectDB();
  try {
    const { id } = req.query;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/products', async (req, res) => {
  await connectDB();
  try {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Invoice Routes
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ success: false });
  }
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
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 4. Business Profile Route
app.get('/api/business', async (req, res) => {
  await connectDB();
  try {
    const business = await Business.findOne(); 
    if (!business) return res.status(404).json({ message: "No business data" });
    res.json(business);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Default Route for checking server status
app.get('/api', (req, res) => {
  res.send("Digi Solutions API is running...");
});

export default app;
