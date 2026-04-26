import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Edit3, Package, X, Printer, Tag, Hash, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  
  // Empty strings to avoid "0" inside boxes
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '', discount: '' });

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

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => { handlePrint(); }, 1000); 
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, code: product.code, 
        price: product.price.toString(), qty: product.qty.toString(), 
        discount: product.discount > 0 ? product.discount.toString() : '' 
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `PRD-${Date.now().toString().slice(-6)}`, price: '', qty: '', discount: '' });
    }
    setShowModal(true);
    setTimeout(() => nameRef.current?.focus(), 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name: formData.name,
        code: formData.code,
        price: Number(formData.price) || 0,
        qty: Number(formData.qty) || 0,
        discount: formData.discount === '' ? 0 : Number(formData.discount),
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
    } catch (err) { toast.error("Error saving data"); }
  };

  const handleKeyNav = (e: any, prev: any, next: any) => {
    if (e.key === 'Enter') { e.preventDefault(); next.current?.focus(); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter italic">Stock <span className="text-indigo-600">Inventory</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">
            + New Item
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-20">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
            const finalPrice = p.price - (p.price * (p.discount || 0) / 100);
            return (
              <div key={p._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl group relative">
                {p.discount > 0 && <div className="absolute -top-3 -right-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg animate-pulse">{p.discount}% OFF</div>}
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={22} /></div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                    {isAdmin && <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>}
                  </div>
                </div>
                <h3 className="font-black uppercase text-sm truncate italic text-slate-800">{p.name}</h3>
                <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-50 font-black italic">
                  <div>
                    <p className="text-lg text-indigo-600">Rs.{finalPrice.toLocaleString()}</p>
                    {p.discount > 0 && <p className="text-[10px] text-slate-300 line-through">Rs.{p.price}</p>}
                  </div>
                  <span className="text-xs text-slate-500">{p.qty} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PRINT AREA (Hidden from UI but accessible by printer) */}
      <div className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50">
        <div ref={printRef}>
          {selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300"><X size={24}/></button>
            <h2 className="text-2xl font-black italic uppercase mb-8">Stock <span className="text-indigo-600">Entry</span></h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input ref={nameRef} type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} onKeyDown={(e) => handleKeyNav(e, nameRef, priceRef)} placeholder="Product Name" required />
              <div className="grid grid-cols-2 gap-4">
                <input ref={priceRef} type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} onKeyDown={(e) => handleKeyNav(e, priceRef, qtyRef)} placeholder="Price" required />
                <input ref={qtyRef} type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} onKeyDown={(e) => handleKeyNav(e, qtyRef, discountRef)} placeholder="Qty" required />
              </div>
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block italic">Discount % (Empty = 0%)</label>
                <input ref={discountRef} type="number" className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="0" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all mt-4">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
