import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Package, X, Printer, Tag, Hash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  
  // Values initial widiyata empty strings damma, ethakota 0 makuwe nathi unath prashnayak na
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    price: '', 
    qty: '', 
    discount: '' 
  });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  // Refs for Keyboard Flow
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const fetchProducts = async () => {
    try {
      if (!user.businessId) return;
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { toast.error("Sync failed"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // PRINTING LOGIC
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => { handlePrint(); }, 700); // Data load wenna podi delay ekak
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        code: product.code, 
        price: product.price.toString(), 
        qty: product.qty.toString(), 
        discount: (product.discount || 0).toString() 
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `PRD-${Date.now().toString().slice(-6)}`, price: '', qty: '', discount: '' });
    }
    setShowModal(true);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

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
      // API ekata yawaddi strings tika numbers walata convert karanawa
      const payload = { 
        ...formData, 
        price: parseFloat(formData.price) || 0,
        qty: parseFloat(formData.qty) || 0,
        discount: parseFloat(formData.discount) || 0,
        businessId: user.businessId 
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Updated Successfully");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Product Added");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error saving!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter underline decoration-indigo-500 decoration-4 underline-offset-8">Stock <span className="text-indigo-600">Control</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all uppercase text-xs">
            <Plus size={18}/> New Item
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-20">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
            const hasDiscount = p.discount > 0;
            const finalPrice = p.price - (p.price * (p.discount || 0) / 100);

            return (
              <div key={p._id} className={`bg-white p-6 rounded-[2.5rem] border ${hasDiscount ? 'border-emerald-200' : 'border-slate-100'} shadow-sm hover:shadow-2xl transition-all group relative`}>
                {hasDiscount && (
                  <div className="absolute -top-3 -right-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg flex items-center gap-1 z-10 animate-pulse">
                    <Tag size={10} /> {p.discount}% OFF
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-3 rounded-2xl ${hasDiscount ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-indigo-600'}`}><Package size={22} /></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                    {isAdmin && <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>}
                  </div>
                </div>

                <h3 className="font-black uppercase text-sm truncate text-slate-800 italic">{p.name}</h3>
                <p className="text-[10px] font-bold text-slate-300 mt-1 tracking-widest">{p.code}</p>

                <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-lg font-black text-indigo-600 italic">Rs.{finalPrice.toLocaleString()}</p>
                    {hasDiscount && <p className="text-[10px] font-bold text-slate-300 line-through">Rs.{p.price}</p>}
                  </div>
                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{p.qty} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Hidden Printer UI */}
      <div style={{ position: 'absolute', top: '-1000px', left: '-1000px' }}>
        <div ref={printRef}>
          {selectedProductForPrint && (
            <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X size={28}/></button>
            <h2 className="text-2xl font-black italic uppercase mb-8">Stock <span className="text-indigo-600">Entry</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1 italic"><Hash size={10}/> Barcode</label>
                <input type="text" className="w-full bg-transparent font-black text-xs tracking-widest outline-none text-indigo-400" value={formData.code} readOnly tabIndex={-1} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name</label>
                <input ref={nameRef} type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, priceRef)} required placeholder="Ex: Soft Drink" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unit Price</label>
                  <input ref={priceRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, qtyRef)} required placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quantity</label>
                  <input ref={qtyRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} onKeyDown={(e) => handleKeyNav(e, priceRef, discountRef)} required placeholder="0" />
                </div>
              </div>

              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block italic">Discount %</label>
                <input ref={discountRef} type="number" step="any" className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} onKeyDown={(e) => handleKeyNav(e, qtyRef, submitRef)} placeholder="0" />
              </div>

              <button ref={submitRef} type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all active:scale-95 mt-4">Save & Close (Enter)</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
    </div>
  );
};

export default Inventory;
