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

// --- SCHEMAS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String }, 
  role: { type: String, default: 'Admin' }, whatsapp: String, address: String, logo: String, businessId: String 
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name: String, 
  code: String, 
  price: Number, 
  qty: Number, 
  discount: { type: Number, default: 0 }, 
  businessId: { type: String, required: true } 
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceId: String, items: Array, total: Number, cashier: String, date: String, businessId: String
}, { timestamps: true }));

// --- ROUTES ---
app.get('/api/products', async (req, res) => {
  await connectDB();
  const bid = req.query.businessId;
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
  await Product.findByIdAndDelete(req.params.id);
  io.emit('update-sync');
  res.json({ success: true });
});

app.post('/api/invoices', async (req, res) => {
  await connectDB();
  const inv = new Invoice(req.body);
  await inv.save();
  for (let item of req.body.items) {
    await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.cartQty } });
  }
  io.emit('update-sync');
  res.json(inv);
});

// Auth & Stats routes... (keep your existing ones)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
