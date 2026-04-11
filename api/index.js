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
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB: Digi Solutions Database");
}).catch((err) => {
    console.error("Connection Error:", err);
});

// --- MODELS ---

const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Staff' },
    businessId: { type: String }
}, { timestamps: true });

const Business = mongoose.model('Business', BusinessSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    discount: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const InvoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, required: true },
    items: Array,
    total: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    cashier: { type: String },
    businessId: { type: String }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

// --- API ENDPOINTS ---

// 1. LOGIN FIX (උඹේ පරණ දත්ත එක්ක වැඩ කරන විදිහට)
app.post('/api/auth/login', async (req, res) => {
    // Frontend එකෙන් එන්නේ username සහ password
    const { username, password } = req.body; 
    
    try {
        // මෙතන username කියන එක user ගේ email එකට සමානද කියලා බලනවා
        const user = await Business.findOne({ email: username });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found!" });
        }

        // Password එක කෙලින්ම සසඳනවා (Hashing නැති නිසා)
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
        return res.status(500).json({ success: false, message: "Server error during login" });
    }
});

// 2. USER MANAGEMENT
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
        res.status(201).json({ success: true, message: "New Staff Member Added" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to add user" });
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

// 3. SECURE SYSTEM RESET
app.post('/api/admin/reset-system', async (req, res) => {
    const { adminPassword } = req.body;
    try {
        const admin = await Business.findOne({ role: 'Admin', password: adminPassword });
        if (!admin) {
            return res.status(403).json({ success: false, message: "Wrong Admin Password" });
        }
        await Product.deleteMany({});
        await Invoice.deleteMany({});
        res.status(200).json({ success: true, message: "Full Shop Data Wiped" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. PRODUCTS
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
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. INVOICES
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

        // STOCK REDUCTION
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
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = app;
