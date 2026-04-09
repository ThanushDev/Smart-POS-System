import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  qty: { type: Number, default: 0 },
  price: { type: Number, required: true },
  image: { type: String }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);