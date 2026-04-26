import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Trash2, Package, X, Percent, Printer } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Barcode from 'react-barcode';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  
  // Form Data with Discount
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

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { if(user.businessId) fetchProducts(); }, [user.businessId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  useEffect(() => { if (selectedProductForPrint) handlePrint(); }, [selectedProductForPrint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, businessId: user.businessId };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
        toast.success("Product Updated!");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Product Added!");
      }
      setShowModal(false);
      setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 });
      fetchProducts();
    } catch (err) { toast.error("Error saving product"); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
      toast.success("Deleted!");
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase">Inventory <span className="text-indigo-600">Stock</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your products and discounts</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2.5 bg-white rounded-xl outline-none shadow-sm font-bold text-sm w-64" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProduct(null); setFormData({name:'', code:'', price:0, qty:0, discount:0}); setShowModal(true); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all uppercase text-xs">
              <Plus size={18}/> Add Product
            </button>
          </div>
        </header>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group relative hover:shadow-xl transition-all">
              {p.discount > 0 && (
                <div className="absolute top-0 right-10 bg-emerald-500 text-white px-3 py-1 rounded-b-xl font-black text-[9px] uppercase">
                  {p.discount}% OFF
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setSelectedProductForPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                   <button onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                   {isAdmin && <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>}
                </div>
              </div>

              <h3 className="font-black uppercase text-sm mb-1 truncate text-slate-800 italic">{p.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 mb-3 tracking-widest">{p.code}</p>

              <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-2">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs.{p.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">Stock</p>
                  <p className={`text-lg font-black ${p.qty < 5 ? 'text-rose-500' : 'text-slate-800'}`}>{p.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Hidden Print Ref */}
      <div className="hidden"><div ref={printRef}>{selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />}</div></div>

      {/* Modal - Updated Labels and decimal support */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={24}/></button>
            
            <h2 className="text-xl font-black italic uppercase mb-8 text-slate-800">
              {editingProduct ? 'Update' : 'Add New'} <span className="text-indigo-600">Product</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Name *</label>
                <input type="text" placeholder="Ex: Coca Cola 500ml" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-indigo-200" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Barcode Code *</label>
                <input type="text" placeholder="Ex: 40012345" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-indigo-200" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Price (Rs.) *</label>
                  <input type="number" step="any" placeholder="0.00" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-indigo-200" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Quantity *</label>
                  <input type="number" step="any" placeholder="0" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-indigo-200" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1">
                    <Percent size={12}/> Discount (Optional)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-400">Default: 0</span>
                </div>
                <input type="number" step="any" placeholder="0.00" className="w-full bg-transparent outline-none font-black text-indigo-700 text-2xl" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4">
                {editingProduct ? 'Save Changes' : 'Confirm & Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
