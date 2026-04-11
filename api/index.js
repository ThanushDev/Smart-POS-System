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
  } catch (err) { console.error("Database Connection Error:", err); }
};

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Staff' },
  businessId: String 
});

const Business = mongoose.models.Business || mongoose.model('Business', userSchema);

const productSchema = new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 } 
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const invoiceSchema = new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, discountTotal: { type: Number, default: 0 },
  paymentMethod: String, cashier: String, businessId: String 
}, { timestamps: true });
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

// --- AUTH ROUTES ---

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    // නම හෝ ඊමේල් දෙකෙන්ම ලොග් විය හැක
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

// --- ADMIN SECURE RESET (පස්වර්ඩ් එක අවශ්‍යයි) ---
app.post('/api/admin/reset-all', async (req, res) => {
  await connectDB();
  const { adminPassword } = req.body;
  try {
    const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
    if (!admin) {
      return res.status(403).json({ success: false, message: "Incorrect Admin Password! Data NOT deleted." });
    }
    // සියලුම දත්ත මකා දැමීම
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    res.json({ success: true, message: "All shop data has been reset successfully." });
  } catch (err) { res.status(500).json({ success: false }); }
});

// --- USER MANAGEMENT ---
app.get('/api/users', async (req, res) => {
  await connectDB();
  try {
    const users = await Business.find(); // සියලුම users පෙන්වයි
    res.json(users);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/users/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = await Business.create(req.body);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) { res.status(500).json({ success: false }); }
});

// --- PRODUCTS & INVOICES (Full Logic) ---
app.get('/api/products', async (req, res) => {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  const newInvoice = await Invoice.create(req.body);
  for (const item of req.body.items) {
    await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
  }
  res.status(201).json(newInvoice);
});

app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  res.json(invoices);
});

export default app;
