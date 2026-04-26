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

// DELETE BUSINESS (DANGER ZONE)
app.post('/api/auth/delete-business', async (req, res) => {
  await connectDB();
  const { businessId, password, adminId } = req.body;
  try {
    const admin = await Business.findById(adminId);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect Admin Password!" });
    }
    // අදාළ Business ID එක තියෙන දත්ත විතරක් MongoDB එකෙන් අයින් කරනවා
    await Product.deleteMany({ businessId });
    await Invoice.deleteMany({ businessId });
    await Business.deleteMany({ businessId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// DASHBOARD STATS
app.get('/api/dashboard/stats', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
  if (!bid) return res.status(400).json({ message: "Business ID missing" });
  try {
    const products = await Product.countDocuments({ businessId: bid });
    const invoices = await Invoice.countDocuments({ businessId: bid });
    const invList = await Invoice.find({ businessId: bid });
    const totalSales = invList.reduce((acc, inv) => acc + (inv.total || 0), 0);
    res.json({ products, invoices, totalSales });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AUTH
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

// PRODUCTS
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
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

// USERS/STAFF
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
  } catch (err) { res.status(400).json({ success: false, message: "Email already exists or Invalid Data" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
