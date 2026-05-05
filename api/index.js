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
  name: String, email: { type: String, unique: true }, password: { type: String }, address: String, whatsapp: String, role: { type: String, default: 'Admin' }, businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 }, businessId: String 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, 
  items: Array, 
  total: Number, 
  cashier: String, 
  date: String, 
  businessId: String, 
  paymentMethod: { type: String, default: 'CASH' }
}, { timestamps: true })); // Timestamps නිසා අපිට date/time ලේසියෙන් ගන්න පුළුවන්

// --- ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = new Business(req.body);
    await newUser.save();
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

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
  try {
    const products = await Product.find({ businessId: req.query.businessId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json([]); }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const { cart, invoiceId, total, currentUser, date, businessId, paymentMethod } = req.body;
    const inv = new Invoice({ 
      invoiceId, 
      items: cart, 
      total: Number(total) || 0, 
      cashier: currentUser?.name || 'Cashier', 
      date, 
      businessId, 
      paymentMethod: paymentMethod || 'CASH' 
    });
    await inv.save();
    for (let item of cart) {
      if (item._id) {
        await Product.findByIdAndUpdate(item._id, { $inc: { qty: -Number(item.quantity || 0) } });
      }
    }
    res.status(201).json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find({ businessId: req.query.businessId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) { res.status(500).json([]); }
});

// *** අලුත් ROUTE එක: පරණ බිල්පතක ID එකෙන් විස්තර ගැනීම ***
app.get('/api/invoices/single/:id', async (req, res) => {
  await connectDB();
  try {
    const invoice = await Invoice.findById(req.params.id);
    res.json(invoice);
  } catch (err) { res.status(500).json(null); }
});

app.delete('/api/invoices/:id', async (req, res) => {
  await connectDB();
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  try {
    const bid = req.query.businessId;
    const totalInvoices = await Invoice.countDocuments({ businessId: bid });
    const totalProducts = await Product.countDocuments({ businessId: bid });
    res.json({ totalInvoices, totalProducts, sales: 0 });
  } catch (err) { res.json({ totalInvoices: 0, totalProducts: 0, sales: 0 }); }
});

export default app;
