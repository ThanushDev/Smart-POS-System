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
    discount: '' 
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Refs for Advanced Keyboard Navigation
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

  // Global Key Listener (Ctrl+N to New Product)
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
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Advanced Navigation Logic (Arrow Keys & Enter)
  const handleKeyDown = (e: React.KeyboardEvent, prevRef: any, nextRef: any) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextRef.current?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      prevRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, businessId: user.businessId };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Updated Successfully");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Product Added");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error saving"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800">Inventory <span className="text-indigo-600 tracking-tighter">Manager</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all uppercase text-xs">
            <Plus size={18}/> New Product
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={20} /></div>
                <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
              </div>
              <h3 className="font-black uppercase text-sm truncate text-slate-800 italic">{p.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{p.code}</p>
              <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50 font-black italic">
                <p className="text-lg text-indigo-600">Rs.{p.price}</p>
                <span className="text-xs px-3 py-1 bg-slate-100 rounded-full">{p.qty}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* KEYBOARD-ONLY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-150">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X size={24}/></button>
            
            <h2 className="text-2xl font-black italic uppercase mb-8">Quick <span className="text-indigo-600">Entry</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1 italic">
                  <Hash size={10}/> Product Code
                </label>
                <input type="text" className="w-full bg-transparent font-black text-xs tracking-[0.2em] outline-none text-indigo-400" value={formData.code} readOnly tabIndex={-1} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name</label>
                <input 
                  ref={nameRef}
                  type="text" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  onKeyDown={(e) => handleKeyDown(e, nameRef, priceRef)}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Price (Rs.)</label>
                  <input 
                    ref={priceRef}
                    type="number" 
                    step="any"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    onKeyDown={(e) => handleKeyDown(e, nameRef, qtyRef)}
                    required 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quantity</label>
                  <input 
                    ref={qtyRef}
                    type="number" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    value={formData.qty} 
                    onChange={(e) => setFormData({...formData, qty: e.target.value})} 
                    onKeyDown={(e) => handleKeyDown(e, priceRef, discountRef)}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Discount %</label>
                <input 
                  ref={discountRef}
                  type="number" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({...formData, discount: e.target.value})} 
                  onKeyDown={(e) => handleKeyDown(e, qtyRef, submitRef)}
                />
              </div>

              <button 
                ref={submitRef}
                type="submit" 
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4"
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
