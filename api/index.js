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

// Business Schema - Admin සහ Staff දෙගොල්ලොම මේකේ save වෙන්නේ
const BusinessSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true, required: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Staff' }, // Admin or Staff
  whatsapp: String,
  address: String,
  logo: String,
  businessId: { type: String, required: true } // මේකෙන් තමයි Shop වෙන් කරන්නේ
});

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  discount: { type: Number, default: 0 },
  businessId: { type: String, required: true } 
}, { timestamps: true }));

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

// 1. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    // Register වෙද්දී එවන businessId එක Schema එකට යනවා
    const newUser = new Business(req.body);
    await newUser.save();
    res.json({ success: true });
  } catch (err) { 
    console.error("Register Error:", err.message);
    res.status(500).json({ success: false, error: err.message }); 
  }
});

app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ email: username, password: password });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (err) { res.status(500).json({ success: false }); }
});

// **DELETE BUSINESS (DANGER ZONE - SECURED)**
app.post('/api/auth/delete-business', async (req, res) => {
  await connectDB();
  const { businessId, password, adminId } = req.body;
  
  if (!businessId || !adminId) return res.status(400).json({ message: "Required fields missing" });

  try {
    const admin = await Business.findById(adminId);
    
    // Check if the requester is the actual admin of that shop
    if (!admin || admin.password !== password || admin.businessId !== businessId) {
      return res.status(401).json({ success: false, message: "Security Check Failed: Incorrect Password" });
    }

    // දත්ත මැකීම - අදාළ businessId එක ඇති දත්ත පමණක් මැකේ
    await Product.deleteMany({ businessId: businessId });
    await Invoice.deleteMany({ businessId: businessId });
    await Business.deleteMany({ businessId: businessId });

    res.json({ success: true, message: "Business account and all associated data deleted." });
  } catch (err) { 
    console.error("Delete Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" }); 
  }
});

// 2. DASHBOARD STATS (400 FIX)
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  // Header එකෙන් හෝ Query එකෙන් ID එක ගන්නවා
  const bid = req.query.businessId || req.headers['business-id'];
  
  if (!bid) return res.status(400).json({ message: "Business ID is required" });

  try {
    const products = await Product.countDocuments({ businessId: bid });
    const invoices = await Invoice.countDocuments({ businessId: bid });
    const invoiceData = await Invoice.find({ businessId: bid });
    const totalSales = invoiceData.reduce((acc, inv) => acc + (inv.total || 0), 0);

    res.json({ products, invoices, totalSales });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. PRODUCTS
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId || req.headers['business-id']; 
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

// 4. INVOICES
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId || req.headers['business-id'];
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Invoice.find({ businessId: bid }).sort({ createdAt: -1 }));
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = await Invoice.create(req.body);
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
    }
    res.status(201).json(newInvoice);
  } catch (err) { res.status(500).json({ success: false }); }
});

// 5. USERS/STAFF MANAGEMENT (500 FIX)
app.get('/api/users', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId || req.headers['business-id'];
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Business.find({ businessId: bid }));
});

app.post('/api/users/add', async (req, res) => {
  await connectDB();
  try {
    const { businessId, email } = req.body;
    if (!businessId) return res.status(400).json({ message: "businessId is missing in request" });

    // එකම Email එකෙන් දෙන්නෙක් බැරි නිසා check කිරීම
    const existing = await Business.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = new Business(req.body);
    await newUser.save();
    res.json({ success: true });
  } catch (err) { 
    console.error("Add User Error:", err.message);
    res.status(500).json({ success: false, error: err.message }); 
  }
});

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
