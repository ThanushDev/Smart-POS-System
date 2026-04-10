import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Digi Solutions DB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- MODELS ---

const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String,
  whatsapp: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  logo: String,
  role: { type: String, default: 'Admin' }
}, { timestamps: true }));

// Product Schema එකේ අකුරු වල වැරදි ඇත්නම් එය නිවැරදි කිරීමට මෙසේ සකස් කරන ලදී
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String,
  code: String, // Error එකක් එන නිසා unique: true තාවකාලිකව ඉවත් කරන ලදී
  category: String,
  price: Number,
  qty: Number,
}, { timestamps: true }));


// --- API ROUTES ---

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
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
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error loading products" });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, code, category, price, qty } = req.body;
    
    // වැදගත්: දත්ත වර්ග (Data types) නිවැරදි දැයි තහවුරු කරගැනීම
    const newProduct = await Product.create({ 
      name, 
      code, 
      category, 
      price: Number(price), 
      qty: Number(qty) 
    });
    
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Save Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Business Profile Route
app.get('/api/business', async (req, res) => {
  try {
    const business = await Business.findOne(); 
    if (!business) return res.status(404).json({ message: "No business data" });
    res.json(business);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default app;
