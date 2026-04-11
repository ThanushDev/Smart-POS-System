const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(() => {
    console.log("DIGI SOLUTIONS DATABASE CONNECTED");
}).catch(err => console.log(err));

// --- SCHEMAS ---
const BusinessSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Staff' },
    businessId: String
}, { timestamps: true });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: String, code: String, price: Number, qty: Number, discount: { type: Number, default: 0 }
}, { timestamps: true }));

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
    invoiceId: String, items: Array, total: Number, discountTotal: { type: Number, default: 0 },
    paymentMethod: String, cashier: String, businessId: String
}, { timestamps: true }));

// --- API ROUTES ---

// LOGIN FIX: මෙන්න මේ logic එකෙන් කොහොම ආවත් ලොග් කරගන්නවා
app.post('/api/auth/login', async (req, res) => {
    // Frontend එකෙන් 'username' හෝ 'email' විදිහට එන ඕනෑම දත්තයක් ගන්නවා
    const identifier = req.body.username || req.body.email;
    const { password } = req.body;

    try {
        // Email එකෙන් හෝ Name එකෙන් හරියටම ගැලපෙන කෙනාව හොයනවා
        const user = await Business.findOne({ 
            $or: [
                { email: identifier }, 
                { name: identifier }
            ] 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found!" });
        }

        // පරණ දත්ත වල password එක සසඳනවා
        if (user.password === password) {
            return res.status(200).json({ 
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
            return res.status(401).json({ success: false, message: "Invalid password!" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

// ACCOUNTS: සියලුම දෙනා පෙන්වීම සහ ඇඩ් කිරීම
app.get('/api/users', async (req, res) => {
    try {
        const users = await Business.find().sort({ role: 1 });
        res.json(users);
    } catch (err) { res.json([]); }
});

app.post('/api/users/add', async (req, res) => {
    try {
        const newUser = new Business(req.body);
        await newUser.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await Business.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// SYSTEM RESET: Admin Password එකෙන් විතරයි
app.post('/api/admin/reset-system', async (req, res) => {
    const { adminPassword } = req.body;
    try {
        const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
        if (!admin) return res.status(403).json({ success: false, message: "Wrong Admin Password" });
        
        await Product.deleteMany({});
        await Invoice.deleteMany({});
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// PRODUCTS & INVOICES SYNC
app.get('/api/products', async (req, res) => {
    try { res.json(await Product.find().sort({ createdAt: -1 })); } catch (err) { res.json([]); }
});

app.get('/api/invoices', async (req, res) => {
    try { res.json(await Invoice.find().sort({ createdAt: -1 })); } catch (err) { res.json([]); }
});

app.post('/api/invoices', async (req, res) => {
    try {
        const newInv = await Invoice.create(req.body);
        for (const item of req.body.items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
        }
        res.status(201).json(newInv);
    } catch (err) { res.status(500).json({ success: false }); }
});

app.listen(5000, () => console.log("Server running on port 5000"));
