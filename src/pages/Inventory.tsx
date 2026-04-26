import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Package, X, Printer, Edit3, Hash, Search, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '', discount: '' });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = "/api/products";

  // Arrow key navigation focus management
  const formRef = useRef<HTMLFormElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const inputs = Array.from(formRef.current?.querySelectorAll('input') || []);
      const index = inputs.indexOf(document.activeElement as HTMLInputElement);
      if (e.key === 'ArrowDown' && index < inputs.length - 1) (inputs[index + 1] as HTMLElement).focus();
      if (e.key === 'ArrowUp' && index > 0) (inputs[index - 1] as HTMLElement).focus();
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { toast.error("Fetch failed"); }
  };

  useEffect(() => { if (user.businessId) fetchProducts(); }, [user.businessId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => new Promise((resolve) => setTimeout(resolve, 1200)),
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => handlePrint(), 400);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price.toString(), qty: product.qty.toString(), discount: (product.discount || 0).toString() });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `SKU-${Math.floor(100000 + Math.random() * 900000)}`, price: '', qty: '', discount: '0' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price), qty: parseFloat(formData.qty), discount: parseFloat(formData.discount) || 0, businessId: user.businessId };
    try {
      if (editingProduct) await axios.put(`${API_URL}/${editingProduct._id}`, payload);
      else await axios.post(API_URL, payload);
      setShowModal(false);
      fetchProducts();
      toast.success("Saved!");
    } catch (err) { toast.error("Error!"); }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 italic font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">Stock <span className="text-indigo-600">Inventory</span></h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search..." className="pl-12 pr-4 py-3 rounded-2xl bg-white border outline-none font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs">Add Item</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border group relative hover:shadow-xl transition-all">
              <div className="flex justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package size={22}/></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => triggerPrint(p)} className="p-2 text-slate-400 hover:text-indigo-600"><Printer size={18}/></button>
                  <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-amber-500"><Edit3 size={18}/></button>
                  <button onClick={() => {if(window.confirm("Delete?")) axios.delete(`${API_URL}/${p._id}`).then(fetchProducts)}} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button>
                </div>
              </div>
              <h3 className="font-black uppercase text-sm truncate">{p.name}</h3>
              <p className="text-[10px] text-slate-300 font-bold mt-1">{p.code}</p>
              <div className="mt-6 flex justify-between items-end border-t pt-4">
                <p className="text-indigo-600 font-black text-lg">Rs.{p.price.toLocaleString()}</p>
                <p className="text-xs font-black text-slate-400">{p.qty} PCS</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <div ref={printRef}>
            {selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName={user.name || "DIGI SOLUTIONS"} />}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 relative shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300"><X size={24}/></button>
              <h2 className="text-2xl font-black uppercase mb-8 italic">Product <span className="text-indigo-600">Details</span></h2>
              <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border focus:bg-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Product Name" required autoFocus />
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border focus:bg-white" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="SKU Code" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="any" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold border focus:bg-white" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Price" required />
                  <input type="number" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold border focus:bg-white" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="Qty" required />
                </div>
                <input type="number" className="w-full p-4 bg-emerald-50 rounded-2xl outline-none font-bold border focus:bg-white" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="Discount %" />
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all">Save Product</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
