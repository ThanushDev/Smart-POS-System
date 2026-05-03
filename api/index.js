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

// 1. LOGIN
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    const user = await Business.findOne({ email: username, password: password });
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: "Invalid Credentials" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 2. GET PRODUCTS
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  res.json(await Product.find({ businessId: bid }).sort({ createdAt: -1 }));
});

// 3. ADD/UPDATE PRODUCT
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

// 4. INVOICE & INVENTORY UPDATE (FIXED)
app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const { cart, invoiceId, total, currentUser, date, businessId } = req.body;

    // Invoice එක Save කිරීම
    const inv = new Invoice({
      invoiceId,
      items: cart, // Frontend එකෙන් එන cart එක items ලෙස save වේ
      total,
      cashier: currentUser?.name || 'Cashier',
      date,
      businessId
    });
    await inv.save();

    // Inventory එකෙන් අඩු කිරීම (Quantity එක හරියටම map කළා)
    for (let item of cart) {
      await Product.findByIdAndUpdate(item._id, { 
        $inc: { qty: -item.quantity } 
      });
    }

    res.status(201).json(inv);
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. DASHBOARD STATS (404 FIX)
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  try {
    const bid = req.query.businessId;
    const totalInvoices = await Invoice.countDocuments({ businessId: bid });
    const totalProducts = await Product.countDocuments({ businessId: bid });
    res.json({ totalInvoices, totalProducts, sales: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
