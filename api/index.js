const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;

// Database Connection
mongoose.connect(MONGODB_URI).then(() => {
    console.log("DIGI SOLUTIONS DB CONNECTED SUCCESSFULLY");
}).catch(err => console.log("DB CONNECTION ERROR:", err));

// --- MODELS ---

const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Staff' },
    businessId: String
}, { timestamps: true });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

const ProductSchema = new mongoose.Schema({
    name: String,
    code: String,
    price: Number,
    qty: Number,
    discount: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const InvoiceSchema = new mongoose.Schema({
    invoiceId: String,
    items: Array,
    total: Number,
    discountTotal: { type: Number, default: 0 },
    paymentMethod: String,
    cashier: String,
    businessId: String
}, { timestamps: true });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

// --- API ROUTES ---

// 1. LOGIN ROUTE (උඹේ Login code එකටම ගැලපෙන්න හැදුවා)
app.post('/api/auth/login', async (req, res) => {
    // Frontend එකෙන් එවන 'username' (Email හෝ Name) සහ 'password' ගන්නවා
    const { username, password } = req.body;

    try {
        // Email එකෙන් හෝ Name එකෙන් user ව හොයනවා
        const user = await Business.findOne({ 
            $or: [{ email: username }, { name: username }] 
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found with that credentials!" });
        }

        // පරණ දත්ත වල Password එක කෙලින්ම සසඳනවා
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
            return res.status(401).json({ success: false, message: "Incorrect password!" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error during login process" });
    }
});

// 2. ACCOUNTS MANAGEMENT
app.get('/api/users', async (req, res) => {
    try {
        const users = await Business.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post('/api/users/add', async (req, res) => {
    try {
        const newUser = new Business(req.body);
        await newUser.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await Business.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 3. SECURE RESET (Admin Password Needed)
app.post('/api/admin/reset-system', async (req, res) => {
    const { adminPassword } = req.body;
    try {
        const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
        if (!admin) return res.status(403).json({ success: false, message: "Invalid Admin Password" });
        
        await Product.deleteMany({});
        await Invoice.deleteMany({});
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. INVENTORY & INVOICING (Original Logic)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) { res.status(500).json([]); }
});

app.post('/api/products', async (req, res) => {
    try {
        const prod = new Product(req.body);
        await prod.save();
        res.status(201).json({ success: true, product: prod });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (err) { res.status(500).json([]); }
});

app.post('/api/invoices', async (req, res) => {
    try {
        const inv = new Invoice(req.body);
        await inv.save();
        // Stock Reduction Logic
        for (const item of req.body.items) {
            await Product.findByIdAndUpdate(item._id, { $inc: { qty: -item.quantity } });
        }
        res.status(201).json(inv);
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Active on Port ${PORT}`));

module.exports = app;
