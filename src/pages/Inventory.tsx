import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Trash2, Package, X, Printer, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Barcode from 'react-barcode';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: 0, qty: 0, discount: 0 });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Inventory load failed!"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  useEffect(() => {
    if (selectedProductForPrint) {
      handlePrint();
    }
  }, [selectedProductForPrint]);

  const triggerBarcodePrint = (product: any) => {
    setSelectedProductForPrint(product);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price, qty: product.qty, discount: product.discount || 0 });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { 'user-role': user.role } };
    try {
      const payload = { ...formData, price: parseFloat(formData.price.toString()), qty: parseFloat(formData.qty.toString()), discount: parseFloat(formData.discount.toString()) };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload, config);
        toast.success("Updated!");
      } else {
        await axios.post('/api/products', payload, config);
        toast.success("Added!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error saving data!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Inventory</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your stock and discounts</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="text" placeholder="Search by name or code..." className="pl-10 pr-4 py-3 bg-white rounded-2xl outline-none shadow-sm font-bold w-64 border border-transparent focus:border-indigo-100 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-xs">
              <Plus size={18}/> New Item
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-10">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm)).map((p) => {
            const hasDiscount = p.discount > 0;
            const finalPrice = p.price - (p.price * p.discount / 100);

            return (
              <div key={p._id} className={`bg-white p-6 rounded-[2.5rem] shadow-sm border ${hasDiscount ? 'border-emerald-100' : 'border-slate-100'} group relative hover:shadow-xl transition-all`}>
                
                {/* DISCOUNT BADGE */}
                {hasDiscount && (
                  <div className="absolute -top-3 -right-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg flex items-center gap-1 animate-bounce">
                    <Tag size={10} /> {p.discount}% OFF
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${hasDiscount ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-indigo-600'}`}>
                    <Package size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => triggerBarcodePrint(p)} title="Print Barcode" className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                     {isAdmin && (
                      <>
                        <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-black uppercase text-sm mb-1 truncate text-slate-800">{p.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 mb-4 tracking-tighter">SKU: {p.code}</p>

                <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase italic leading-none mb-1">Selling Price</p>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-indigo-600 italic">Rs.{finalPrice.toLocaleString()}</span>
                        {hasDiscount && (
                            <span className="text-[10px] font-bold text-slate-300 line-through">Rs.{p.price.toLocaleString()}</span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase italic leading-none mb-1">In Stock</p>
                    <p className={`text-lg font-black ${p.qty < 10 ? 'text-rose-500' : 'text-slate-700'}`}>{p.qty}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="hidden">
        <div ref={printRef}>
           {selectedProductForPrint && (
             <PrintableBarcode 
               product={selectedProductForPrint} 
               businessName="DIGI SOLUTIONS" 
             />
           )}
        </div>
      </div>

      {/* MODAL (Style Optimized) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black italic uppercase mb-8">Product <span className="text-indigo-600">Details</span></h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Barcode Code</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Base Price</label>
                    <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Qty</label>
                    <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 transition-all" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
                </div>
              </div>
              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 block">Active Discount %</label>
                <input type="number" step="any" className="w-full bg-transparent outline-none font-black text-emerald-700 text-2xl" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
