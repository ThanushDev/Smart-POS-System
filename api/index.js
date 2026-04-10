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
  } catch (err) { console.error("DB Error:", err); }
};

// --- MODELS ---
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: { type: String, required: true }, role: { type: String, default: 'Admin' }
}));

// --- ROUTES ---

// 1. Login Route (Frontend එකේ URL එකට ගැලපෙන සේ)
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  try {
    const { username, password } = req.body; // Frontend එකෙන් එවන්නේ username සහ password
    const user = await Business.findOne({ email: username, password: password });
    
    if (user) {
      res.json({ 
        success: true, 
        user: { name: user.name, role: user.role, email: user.email } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2. Register Route
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  try {
    const { businessName, email, password } = req.body;
    const existing = await Business.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newBus = await Business.create({ name: businessName, email, password });
    res.status(201).json({ success: true, user: newBus });
  } catch (error) { res.status(500).json({ success: false }); }
});

// ... අනෙක් Routes (Products, Invoices, Stats) කලින් ලබාදුන් පරිදිම මෙතැනට එක් කරන්න ...

// අනිවාර්යයෙන්ම අවසානයට මෙය තිබිය යුතුයි
export default app;
