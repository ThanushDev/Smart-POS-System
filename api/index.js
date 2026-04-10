// api/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Logo සහ Images සඳහා limit එක වැඩි කර ඇත

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Error:", err));

// Models (Inline definition for simplicity in single file serverless)
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, code: String, price: Number, qty: Number, image: String, discount: Number
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, paymentMethod: String, cashier: String
}, { timestamps: true }));

const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, whatsapp: String, email: String, logo: String
}));

// --- API ROUTES ---

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const products = await Product.find({});
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const todayInvoices = await Invoice.find({ createdAt: { $gte: startOfToday } });
    
    res.json({
      todayBills: todayInvoices.length,
      todayIncome: todayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      totalProducts: products.length,
      lowStockCount: products.filter(p => p.qty <= 5).length,
      lowStockItems: products.filter(p => p.qty <= 5)
    });
  } catch (err) { res.status(500).json(err); }
});

// Products API
app.get('/api/products', async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

// Invoices API
app.get('/api/invoices', async (req, res) => {
  const invoices = await Invoice.find({}).sort({ createdAt: -1 });
  res.json(invoices);
});

app.post('/api/invoices', async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.json(invoice);
});

// Business/Registration API
app.get('/api/business', async (req, res) => {
  const biz = await Business.findOne();
  res.json(biz);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const biz = await Business.create({
      name: req.body.businessName,
      whatsapp: req.body.whatsapp,
      email: req.body.email,
      logo: req.body.logo
    });
    res.json({ success: true, business: biz });
  } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = app;