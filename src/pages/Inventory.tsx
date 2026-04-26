import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Edit3, Trash2, Package, X, Percent, Printer } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    price: '', 
    qty: '', 
    discount: '0' 
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 1. Auto-generate Unique Product Code
  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRD-${timestamp}${random}`;
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { if(user.businessId) fetchProducts(); }, [user.businessId]);

  // Keyboard Shortcuts for Main Screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        openModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', 
        code: generateProductCode(), // Auto-fill on open
        price: '', 
        qty: '', 
        discount: '0' 
      });
    }
    setShowModal(true);
    // Focus Name field after modal opens
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, businessId: user.businessId };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Updated!");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Added!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error saving product"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase text-slate-800">Inventory</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Press Ctrl+N to add new</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 bg-white rounded-xl outline-none shadow-sm font-bold text-sm w-64 border border-transparent focus:border-indigo-300 transition-all" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button 
              onClick={() => openModal()} 
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all uppercase text-xs"
            >
              <Plus size={18}/> New Product
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group relative hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-1">
                   <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                </div>
              </div>
              <h3 className="font-black uppercase text-sm mb-1 truncate text-slate-800 italic">{p.name}</h3>
              <p className="text-[10px] font-bold text-indigo-400 mb-3 tracking-widest">{p.code}</p>
              <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase">Price</p>
                  <p className="text-lg font-black text-slate-800 italic">Rs.{p.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Stock</p>
                  <p className="text-lg font-black text-indigo-600">{p.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* KEYBOARD OPTIMIZED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={24}/></button>
            
            <h2 className="text-xl font-black italic uppercase mb-8 text-slate-800">
              {editingProduct ? 'Edit' : 'New'} <span className="text-indigo-600">Product</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Auto Generated Code - READ ONLY */}
              <div className="opacity-60">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Product Code (System Generated)</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-100 rounded-2xl font-black text-xs tracking-[0.2em] outline-none cursor-not-allowed" 
                  value={formData.code} 
                  readOnly 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name *</label>
                <input 
                  ref={nameInputRef}
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unit Price *</label>
                  <input 
                    type="number" 
                    step="any"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Initial Qty *</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" 
                    value={formData.qty} 
                    onChange={(e) => setFormData({...formData, qty: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <label className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1 mb-1">
                   Discount % (Keyboard Input)
                </label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({...formData, discount: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Press Enter to Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
