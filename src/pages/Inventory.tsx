import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Package, X, Printer, Edit3, Hash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '', discount: '' });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = "https://smart-pos-system-lilac.vercel.app";

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/api/products?businessId=${user.businessId}`);
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => handlePrint(), 1000);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price.toString(), qty: product.qty.toString(), discount: product.discount.toString() });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `SKU-${Math.floor(100000 + Math.random() * 900000)}`, price: '', qty: '', discount: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price), qty: parseFloat(formData.qty), discount: parseFloat(formData.discount) || 0, businessId: user.businessId };
    try {
      if (editingProduct) await axios.put(`${API_URL}/api/products/${editingProduct._id}`, payload);
      else await axios.post(`${API_URL}/api/products`, payload);
      setShowModal(false);
      fetchProducts();
      toast.success("Done!");
    } catch { toast.error("Error!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 italic">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between mb-10">
          <h1 className="text-3xl font-black uppercase">Stock <span className="text-indigo-600">Inventory</span></h1>
          <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">+ Add Item</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-xl group relative">
              {p.discount > 0 && <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{p.discount}% OFF</div>}
              <div className="flex justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={22}/></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => triggerPrint(p)} className="p-2 text-indigo-400"><Printer size={18}/></button>
                  <button onClick={() => openModal(p)} className="p-2 text-amber-500"><Edit3 size={18}/></button>
                </div>
              </div>
              <h3 className="font-black uppercase text-sm">{p.name}</h3>
              <p className="text-[10px] text-slate-300 font-bold tracking-widest">{p.code}</p>
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between font-black">
                <p className="text-indigo-600">Rs.{(p.price - (p.price * p.discount / 100)).toLocaleString()}</p>
                <span className="text-xs text-slate-400">{p.qty} left</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50">
        <div ref={printRef}>
          {selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300"><X size={24}/></button>
            <h2 className="text-2xl font-black uppercase mb-6">Product <span className="text-indigo-600">Entry</span></h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1"><Hash size={10}/> SKU Code</label>
                <input type="text" className="w-full bg-transparent font-black text-sm outline-none text-indigo-500" value={formData.code} readOnly />
              </div>
              <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Price" required />
                <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="Qty" required />
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl">
                <label className="text-[10px] font-black text-emerald-600 block">Discount %</label>
                <input type="number" step="any" className="w-full bg-transparent font-black text-emerald-700 text-xl outline-none" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="0.00" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
