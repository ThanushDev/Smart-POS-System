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

// Business Model
const Business = mongoose.models.Business || mongoose.model('Business', new mongoose.Schema({
  name: String,
  whatsapp: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  logo: String,
  role: { type: String, default: 'Admin' }
}, { timestamps: true }));

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { businessName, whatsapp, email, password, logo } = req.body;
    const existingUser = await Business.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const newBusiness = await Business.create({
      name: businessName,
      whatsapp,
      email,
      password,
      logo
    });

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

// Vercel සඳහා export කිරීම
export default app;
