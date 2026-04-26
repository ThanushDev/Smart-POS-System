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
  
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    price: 0, 
    qty: 0, 
    discount: 0 
  });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  // Keyboard Refs
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // 1. Data Loading Fix (Adding businessId)
  const fetchProducts = async () => {
    try {
      if (!user.businessId) return;
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { 
      toast.error("Inventory sync failed!"); 
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // 2. Printing Fix
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    // Component eka render wenna podi welawak dila print eka trigger karanawa
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        code: product.code, 
        price: product.price, 
        qty: product.qty, 
        discount: product.discount || 0 
      });
    } else {
      setEditingProduct(null);
      const autoCode = `PRD-${Date.now().toString().slice(-6)}`;
      setFormData({ name: '', code: autoCode, price: 0, qty: 0, discount: 0 });
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

  // 3. Update & Discount Fix
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Data types conversion logic
      const payload = { 
        ...formData, 
        price: Number(formData.price),
        qty: Number(formData.qty),
        discount: Number(formData.discount),
        businessId: user.businessId 
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Product Updated Successfully");
      } else {
        await axios.post('/api/products', payload);
        toast.success("New Product Added");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { 
      toast.error("Error saving data. Please check connection."); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">Inventory <span className="text-indigo-600">Stock</span></h1>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="px-4 py-3 bg-white rounded-2xl outline-none shadow-sm font-bold w-64 border border-transparent focus:border-indigo-200 transition-all" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all uppercase text-xs">
              <Plus size={18}/> New Item
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-20">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
            const hasDiscount = p.discount > 0;
            const finalPrice = p.price - (p.price * (p.discount || 0) / 100);

            return (
              <div key={p._id} className={`bg-white p-6 rounded-[2.5rem] border ${hasDiscount ? 'border-emerald-100' : 'border-slate-100'} shadow-sm hover:shadow-xl transition-all group relative`}>
                {hasDiscount && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full font-black text-[9px] shadow-lg flex items-center gap-1">
                    <Tag size={10} /> {p.discount}% OFF
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className={`p-3 rounded-2xl ${hasDiscount ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-indigo-600'}`}><Package size={20} /></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={16}/></button>
                    {isAdmin && <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={16}/></button>}
                  </div>
                </div>

                <h3 className="font-black uppercase text-sm truncate text-slate-800 italic leading-none">{p.name}</h3>
                <p className="text-[10px] font-bold text-slate-300 mt-2 tracking-widest">{p.code}</p>

                <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50 font-black italic">
                  <div>
                    <p className="text-[9px] text-slate-300 uppercase leading-none mb-1">Net Price</p>
                    <p className="text-lg text-indigo-600">Rs.{finalPrice.toLocaleString()}</p>
                    {hasDiscount && <p className="text-[10px] text-slate-300 line-through">Rs.{p.price}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-300 uppercase leading-none mb-1">Qty</p>
                    <p className="text-lg text-slate-700">{p.qty}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Barcode Print Container (Not hidden via CSS to ensure capture) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef}>
          {selectedProductForPrint && (
            <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-rose-500"><X size={24}/></button>
            <h2 className="text-2xl font-black italic uppercase mb-8">Product <span className="text-indigo-600">Details</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1 italic"><Hash size={10}/> Barcode Code</label>
                <input type="text" className="w-full bg-transparent font-black text-xs tracking-[0.2em] outline-none text-indigo-400" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name</label>
                <input ref={nameRef} type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, priceRef)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Price</label>
                  <input ref={priceRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 shadow-inner" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} onKeyDown={(e) => handleKeyNav(e, nameRef, qtyRef)} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qty</label>
                  <input ref={qtyRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 shadow-inner" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} onKeyDown={(e) => handleKeyNav(e, priceRef, discountRef)} required />
                </div>
              </div>

              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block italic">Discount %</label>
                <input ref={discountRef} type="number" step="any" className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} onKeyDown={(e) => handleKeyNav(e, qtyRef, submitRef)} />
              </div>

              <button ref={submitRef} type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all mt-4">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
