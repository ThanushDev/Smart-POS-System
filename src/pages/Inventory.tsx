import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, Plus, Edit3, Trash2, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) {
      toast.error("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', { ...formData, businessId: user.businessId });
      toast.success("Product Added!");
      setShowModal(false);
      setFormData({ name: '', code: '', price: '', qty: '' });
      fetchProducts();
    } catch (err) { toast.error("Failed to add product"); }
  };

  const deleteProduct = async (id: string) => {
    if(window.confirm("Delete this item?")) {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    }
  };

  const filtered = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black italic uppercase">Inventory <span className="text-indigo-600">Stock</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage products & Stock levels</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            <Plus size={16}/> Add Product
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input type="text" placeholder="Search by name or code..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-4">Item Details</th>
                <th className="px-8 py-4">Price (Rs.)</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center font-bold text-slate-300 italic uppercase">Loading Inventory...</td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase text-sm">{p.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">SKU: {p.code}</p>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">{p.price.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.qty <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {p.qty} IN STOCK
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => deleteProduct(p._id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black italic uppercase mb-6">New <span className="text-indigo-600">Product</span></h2>
            <div className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
              <input type="text" placeholder="Product Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required/>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required/>
                <input type="number" placeholder="Quantity" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} required/>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">Save Item</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default Inventory;
