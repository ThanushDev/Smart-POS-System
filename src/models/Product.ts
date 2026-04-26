import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  qty: { type: Number, default: 0 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  category: { type: String },
  image: { type: String },
  businessId: { type: String, required: true } // <--- MEKA ANIWARYAYEN ONNA
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
