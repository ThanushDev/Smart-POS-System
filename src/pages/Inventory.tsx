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
    name: '', code: '', price: '', qty: '', discount: '' 
  });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

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

  // PRINTING FIX
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    // Component eka load wela SVG eka draw wenna 1 second denawa
    setTimeout(() => { handlePrint(); }, 1000); 
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        code: product.code, 
        price: product.price.toString(), 
        qty: product.qty.toString(), 
        discount: product.discount ? product.discount.toString() : '' 
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
      const payload = { 
        name: formData.name,
        code: formData.code,
        price: Number(formData.price) || 0,
        qty: Number(formData.qty) || 0,
        discount: formData.discount ? Number(formData.discount) : 0, // Discount eka nattam 0
        businessId: user.businessId 
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Product Updated");
      } else {
        await axios.post('/api/products', payload);
        toast.success("New Product Added");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error saving data"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">Stock <span className="text-indigo-600">Inventory</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:scale-105 transition-all uppercase text-xs tracking-widest">
            <Plus size={18}/> New Product
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-20">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
            const hasDiscount = p.discount > 0;
            const finalPrice = p.price - (p.price * (p.discount || 0) / 100);

            return (
              <div key={p._id} className={`bg-white p-6 rounded-[2.5rem] border ${hasDiscount ? 'border-emerald-200 shadow-emerald-50' : 'border-slate-100 shadow-slate-100'} shadow-xl group relative`}>
                {hasDiscount && (
                  <div className="absolute -top-3 -right-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg flex items-center gap-1 z-10">
                    <Tag size={10} /> {p.discount}% OFF
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-3 rounded-2xl ${hasDiscount ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-indigo-600'}`}><Package size={22} /></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg" title="Print Barcode"><Printer size={18}/></button>
                    {isAdmin && <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>}
                  </div>
                </div>
                <h3 className="font-black uppercase text-sm truncate text-slate-800 italic">{p.name}</h3>
                <p className="text-[10px] font-bold text-slate-300 mt-1 tracking-widest">{p.code}</p>
                <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50 font-black italic">
                  <div>
                    <p className="text-lg text-indigo-600">Rs.{finalPrice.toLocaleString()}</p>
                    {hasDiscount && <p className="text-[10px] text-slate-300 line-through">Rs.{p.price}</p>}
                  </div>
                  <span className="text-xs text-slate-500">{p.qty} items</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PRINT CONTAINER FIX: 
          Meka display:none kale naha. opacity-0 damma. 
          Ethakota browser eka meka render karanawa (so Barcode library works), 
          eth user-ta penne na. 
      */}
      <div className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50">
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
            <h2 className="text-2xl font-black italic uppercase mb-8">Stock <span className="text-indigo-600">Update</span></h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1 italic"><Hash size={10}/> SKU Code</label>
                <input type="text" className="w-full bg-transparent font-black text-xs tracking-widest outline-none text-indigo-400" value={formData.code} readOnly tabIndex={-1} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name</label>
                <input ref={nameRef} type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, priceRef)} required placeholder="Product Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unit Price</label>
                  <input ref={priceRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, qtyRef)} required placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Stock Qty</label>
                  <input ref={qtyRef} type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} onKeyDown={(e) => handleKeyNav(e, priceRef, discountRef)} required placeholder="0" />
                </div>
              </div>
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block italic">Discount % (Empty = No Discount)</label>
                <input ref={discountRef} type="number" step="any" className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} onKeyDown={(e) => handleKeyNav(e, qtyRef, submitRef)} placeholder="Leave empty for 0" />
              </div>
              <button ref={submitRef} type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all mt-4">Save (Enter)</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
