import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

// Database Connection Logic
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected Successfully to Digi Solutions Database");
  } catch (err) { 
    console.error("Critical MongoDB Connection Error:", err); 
  }
};

// --- DATABASE MODELS & SCHEMAS ---

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Staff' },
  businessId: String,
  whatsapp: String
}, { timestamps: true });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      total: Number
    }
  ],
  total: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  cashier: { type: String, required: true },
  businessId: String
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

// --- API ROUTES ---

// 1. AUTHENTICATION
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  try {
    const user = await Business.findOne({ 
      $or: [{ email: username }, { name: username }], 
      password: password 
    });

    if (user) {
      res.status(200).json({ 
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
      res.status(401).json({ success: false, message: "Invalid credentials. Access Denied." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error during login." });
  }
});

// 2. USER MANAGEMENT (Fetching all accounts)
app.get('/api/users', async (req, res) => {
  await connectDB();
  try {
    const users = await Business.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

app.post('/api/users/register', async (req, res) => {
  await connectDB();
  try {
    const newUser = new Business(req.body);
    await newUser.save();
    res.status(201).json({ success: true, message: "User registered in MongoDB", user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// 3. SECURE ADMIN ACTIONS (Full Shop Reset)
app.post('/api/admin/reset-all', async (req, res) => {
  await connectDB();
  const { adminPassword } = req.body;
  try {
    const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
    if (!admin) {
      return res.status(403).json({ success: false, message: "Incorrect Admin Password! Wipe Cancelled." });
    }
    
    // Deleting all collection data but keeping users
    await Product.deleteMany({});
    await Invoice.deleteMany({});
    
    res.status(200).json({ success: true, message: "System Wiped: All Products and Invoices deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Reset operation failed." });
  }
});

// 4. INVENTORY MANAGEMENT
app.get('/api/products', async (req, res) => {
  await connectDB();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/products', async (req, res) => {
  await connectDB();
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.put('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  await connectDB();
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 5. INVOICING & STOCK CONTROL
app.get('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    
    // Automatic stock reduction logic
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(
        item._id, 
        { $inc: { qty: -item.quantity } }
      );
    }
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default app;
