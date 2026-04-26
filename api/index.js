import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();

// Socket.io Setup for Real-time Dashboard Updates
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

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

// --- SCHEMAS ---
const BusinessSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true, required: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }, 
  whatsapp: String,
  address: String,
  logo: String,
  businessId: { type: String, required: true } 
});
const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  businessId: { type: String, required: true } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, 
  items: Array, 
  total: Number, 
  cashier: String,
  date: String,
  businessId: { type: String, required: true }
}, { timestamps: true }));

// --- ROUTES ---

// 1. AUTH & SHOP MANAGEMENT
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
  if (user) res.json({ success: true, user });
  else res.status(401).json({ success: false, message: "Invalid Credentials" });
});

app.post('/api/auth/delete-business', async (req, res) => {
  await connectDB();
  const { businessId, password, adminId } = req.body;
  try {
    const admin = await Business.findById(adminId);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect Admin Password!" });
    }
    await Product.deleteMany({ businessId });
    await Invoice.deleteMany({ businessId });
    await Business.deleteMany({ businessId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 2. USERS (Accounts.tsx Fixes)
app.get('/api/users', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  res.json(await Business.find({ businessId: bid }));
});

app.post('/api/users/add', async (req, res) => {
  await connectDB();
  try {
    const newUser = new Business(req.body);
    await newUser.save();
    res.json({ success: true });
  } catch (err) { 
    if (err.code === 11000) {
       res.status(400).json({ success: false, message: "This Email is already registered!" });
    } else {
       res.status(400).json({ success: false, message: err.message }); 
    }
  }
});

// Missing User Edit Route
app.put('/api/users/:id', async (req, res) => {
  await connectDB();
  try {
    await Business.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});


// 3. PRODUCTS (Inventory & New Bill Fixes)
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Product.find({ businessId: bid }).sort({ createdAt: -1 }));
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    io.emit('update-sync'); // Refresh dashboards
    res.json(newProduct);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    io.emit('update-sync');
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    io.emit('update-sync');
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});


// 4. INVOICES (New Bill & Report Fixes)
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  if (!bid) return res.status(400).json({ message: "Business ID required" });
  res.json(await Invoice.find({ businessId: bid }).sort({ createdAt: -1 }));
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();

    // Deduct stock quantity automatically
    for (let item of req.body.items) {
       await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.cartQty } });
    }

    io.emit('update-sync'); // Real-time dashbord update trigger
    res.json(newInvoice);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


// 5. DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  if (!bid) return res.status(400).json({ message: "Business ID is missing" });

  try {
    const today = new Date().toISOString().split('T')[0];
    const products = await Product.find({ businessId: bid });
    const invoices = await Invoice.find({ businessId: bid });
    const todayInvoices = invoices.filter(inv => inv.date === today);

    res.json({
      todayBills: todayInvoices.length,
      monthBills: invoices.length,
      todayIncome: todayInvoices.reduce((acc, inv) => acc + inv.total, 0),
      monthIncome: invoices.reduce((acc, inv) => acc + inv.total, 0),
      totalProducts: products.length,
      lowStockCount: products.filter(p => p.qty <= 5).length,
      totalStockValue: products.reduce((acc, p) => acc + (p.price * p.qty), 0),
      lowStockItems: products.filter(p => p.qty <= 5)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
// Make sure to listen on the SERVER, not just the APP, so Socket.io works
server.listen(PORT, () => console.log(`Server & Socket running on port ${PORT}`));
