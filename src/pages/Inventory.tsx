import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Image as ImageIcon, X, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [productImage, setProductImage] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]); // මුලින්ම හිස් array එකක් ලෙස තබා ඇත
  const [isLoading, setIsLoading] = useState(true);

  // Database එකෙන් දත්ත ලබා ගැනීම
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Failed to load products from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ... (handleSave, handleDelete, handleImageUpload functions remain the same as previous)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Inventory Management</h1>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Add Product</button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Qty</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No products found. Please add a product.</td></tr>
              ) : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
                <tr key={product._id || product.id}>
                  {/* Table Row Data */}
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">{product.code}</td>
                  <td className="px-6 py-4">{product.qty}</td>
                  <td className="px-6 py-4">Rs. {product.price}</td>
                  <td className="px-6 py-4">
                     {/* Edit/Delete Buttons */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
