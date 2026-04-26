import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Edit3, Package, X, Hash } from 'lucide-react';
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
  
  // Input Refs for Arrow Navigation
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const generateProductCode = () => `PRD-${Date.now().toString().slice(-6)}`;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { toast.error("Sync failed"); }
  };

  useEffect(() => { if(user.businessId) fetchProducts(); }, [user.businessId]);

  // Handle Global Ctrl+N shortcut
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: generateProductCode(), price: '', qty: '', discount: '0' });
    }
    setShowModal(true);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

  // Keyboard Navigation: Enter, Up/Down Arrows
  const handleKeyNav = (e: React.KeyboardEvent, prev: any, next: any) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      next.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      prev.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, businessId: user.businessId };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Product Updated");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Added to Inventory");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Database Error"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter underline decoration-indigo-500 decoration-4 underline-offset-8">Stock <span className="text-indigo-600">Inventory</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all uppercase text-xs">
            <Plus size={18}/> New Product
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner"><Package size={20} /></div>
                <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
              </div>
              <h3 className="font-black uppercase text-sm truncate text-slate-800 italic">{p.name}</h3>
              <p className="text-[10px] font-black text-slate-300 mt-1 tracking-widest">{p.code}</p>
              <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50">
                <p className="text-lg font-black text-indigo-600 italic">Rs.{p.price}</p>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Stock</p>
                    <span className="text-xs font-black text-slate-600">{p.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative border border-white/20 animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500 transition-colors"><X size={24}/></button>
            
            <h2 className="text-2xl font-black italic uppercase mb-8">Product <span className="text-indigo-600 italic">Entry</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1 italic">
                    <Hash size={10}/> Product Code
                  </label>
                  <input type="text" className="bg-transparent font-black text-xs tracking-widest outline-none text-indigo-400 cursor-not-allowed" value={formData.code} readOnly tabIndex={-1} />
                </div>
                <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg uppercase">System Generated</span>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name</label>
                <input 
                  ref={nameRef}
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  onKeyDown={(e) => handleKeyNav(e, nameRef, priceRef)}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unit Price</label>
                  <input 
                    ref={priceRef}
                    type="number" 
                    step="any"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    onKeyDown={(e) => handleKeyNav(e, nameRef, qtyRef)}
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quantity</label>
                  <input 
                    ref={qtyRef}
                    type="number" 
                    step="any"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    value={formData.qty} 
                    onChange={(e) => setFormData({...formData, qty: e.target.value})} 
                    onKeyDown={(e) => handleKeyNav(e, priceRef, discountRef)}
                    required 
                  />
                </div>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-inner">
                <label className="text-[10px] font-black uppercase text-indigo-600 mb-1 block italic">Discount % (Supports 0.2, 0.5 etc.)</label>
                <input 
                  ref={discountRef}
                  type="number" 
                  step="any"
                  className="w-full bg-transparent outline-none font-black text-indigo-700 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({...formData, discount: e.target.value})} 
                  onKeyDown={(e) => handleKeyNav(e, qtyRef, submitRef)}
                />
              </div>

              <button 
                ref={submitRef}
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4"
              >
                Save Product (Enter)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
