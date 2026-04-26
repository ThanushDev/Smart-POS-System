import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
// Barcode data/Images yawanna lesi wenna limit eka wedi kala
app.use(express.json({ limit: '50mb' }));

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

// --- SCHEMAS (FIXED) ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true, required: true }, 
  password: { type: String, required: true }, 
  role: { type: String, default: 'Admin' }, 
  whatsapp: String,
  address: String,
  logo: String,
  businessId: { type: String, required: true } 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  discount: { type: Number, default: 0 }, // FIXED: Me field eka damma
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

// PRODUCTS (Inventory & Discount Fix)
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
    io.emit('update-sync'); 
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

// AUTH & INVOICES (Oyaage thiyena widiyatama)
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  const user = await Business.findOne({ email: username, password: password });
  if (user) res.json({ success: true, user });
  else res.status(401).json({ success: false, message: "Invalid Credentials" });
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    for (let item of req.body.items) {
       await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.cartQty } });
    }
    io.emit('update-sync'); 
    res.json(newInvoice);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
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
server.listen(PORT, () => console.log(`Server & Socket running on port ${PORT}`));
