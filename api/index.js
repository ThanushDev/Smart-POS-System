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
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String }, 
  address: String,    // අලුතින් එක් කළා
  whatsapp: String,   // අලුතින් එක් කළා
  role: { type: String, default: 'Admin' }, 
  businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  discount: { type: Number, default: 0 }, 
  businessId: String 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, cashier: String, date: String, businessId: String
}, { timestamps: true }));

// --- ROUTES ---

// REGISTER (අලුතින් එක් කළා)
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = new Business(req.body);
    await newUser.save();
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body;
    const user = await Business.findOne({ email: username, password: password });
    if (user) res.json({ success: true, user });
    else res.status(401).json({ success: false, message: "Invalid Credentials" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const bid = req.query.businessId;
    const products = await Product.find({ businessId: bid }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json([]); }
});

// ADD PRODUCT (මෙන්න මේක නැති නිසයි 404 ආවේ)
app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE PRODUCT (Edit කරද්දී එන 404 එකට විසඳුම)
app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SAVE INVOICE & UPDATE STOCK
app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const { cart, invoiceId, total, currentUser, date, businessId } = req.body;
    const inv = new Invoice({ invoiceId, items: cart, total: Number(total) || 0, cashier: currentUser?.name || 'Cashier', date, businessId });
    await inv.save();
    for (let item of cart) {
      if (item._id) {
        await Product.findByIdAndUpdate(item._id, { $inc: { qty: -Number(item.quantity || 0) } });
      }
    }
    res.status(201).json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  try {
    const bid = req.query.businessId;
    const totalInvoices = await Invoice.countDocuments({ businessId: bid });
    const totalProducts = await Product.countDocuments({ businessId: bid });
    res.json({ totalInvoices, totalProducts, sales: 0 });
  } catch (err) { res.json({ totalInvoices: 0, totalProducts: 0, sales: 0 }); }
});

app.get('/api/test', (req, res) => res.json({ status: "API is Running" }));

export default app;
