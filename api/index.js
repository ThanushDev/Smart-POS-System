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
  } catch (err) { console.error("MongoDB Error:", err); }
};

// --- MODELS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' },
  whatsapp: String,
  businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, discountTotal: { type: Number, default: 0 },
  paymentMethod: String, cashier: String, businessId: String 
}, { timestamps: true }));

// --- API ROUTES ---

// LOGIN FIX: Email හෝ Name එකෙන් දෙකෙන්ම Login විය හැකි ලෙස සකස් කර ඇත
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body; // Frontend එකෙන් එන 'username' (Email එක විය හැක)
  try {
    // වැදගත්: මෙහිදී email එක username එකට සමානදැයි බලයි
    const user = await Business.findOne({ 
      $or: [ { email: username }, { name: username } ],
      password: password 
    });

    if (user) {
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
      res.status(401).json({ success: false, message: "Invalid credentials. Please check Email/Password." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// INVOICES & PRODUCTS (Your original logic stays same)
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

app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/products', async (req, res) => {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.get('/api/business', async (req, res) => {
  await connectDB();
  const business = await Business.findOne();
  res.json(business || { name: "Digi Solutions" });
});

// Register Staff/User Route
app.post('/api/users/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = await Business.create(req.body);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) { res.status(500).json({ success: false }); }
});

export default app;
