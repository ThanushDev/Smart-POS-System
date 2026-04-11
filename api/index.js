const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Logic
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("------------------------------------------");
    console.log("Successfully connected to Digi Solutions DB");
    console.log("------------------------------------------");
}).catch((err) => {
    console.error("Database connection error:", err);
});

// --- SCHEMAS & MODELS ---

// User & Business Schema
const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Staff' }, // Staff or Admin
    businessId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Business = mongoose.model('Business', BusinessSchema);

// Product Schema
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    discount: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

// Invoice Schema
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
    cashier: { type: String },
    businessId: { type: String }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

// --- API ENDPOINTS ---

// 1. LOGIN (Fix: Name or Email support)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Business.findOne({ 
            $or: [{ email: username }, { name: username }], 
            password: password 
        });

        if (user) {
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
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Login error" });
    }
});

// 2. USER MANAGEMENT (Get & Add & Delete)
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
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "User creation failed" });
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

// 3. SECURE SYSTEM RESET (Admin Password Needed)
app.post('/api/admin/reset-system', async (req, res) => {
    const { adminPassword } = req.body;
    try {
        const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Access Denied: Incorrect Password" });
        }
        await Product.deleteMany({});
        await Invoice.deleteMany({});
        res.status(200).json({ success: true, message: "System Wiped" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. PRODUCT ROUTES (Full original logic)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProd = new Product(req.body);
        await newProd.save();
        res.status(201).json({ success: true, product: newProd });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. INVOICE ROUTES (Stock auto-reduction is included)
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.post('/api/invoices', async (req, res) => {
    try {
        const newInvoice = new Invoice(req.body);
        await newInvoice.save();

        // STOCK REDUCTION LOGIC
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
