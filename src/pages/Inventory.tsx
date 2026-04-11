import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Edit3, Trash2, Package, Tag, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', code: '', price: 0, qty: 0, discount: 0 });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Modal එක Open කරන Function
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
    if (!isAdmin) return;

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData, { headers: { 'user-role': user.role } });
        toast.success("Product Updated");
      } else {
        await axios.post('/api/products', formData);
        toast.success("Product Added");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Action failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
        toast.success("Product removed");
        fetchProducts();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Inventory</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white rounded-xl outline-none shadow-sm font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {isAdmin && (
              <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
                <Plus size={18}/> Add Item
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 font-sans">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {isAdmin && (
                    <>
                      <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                    </>
                  )}
                </div>
              </div>
              <h3 className="font-black uppercase text-sm mb-1">{p.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-2">CODE: {p.code}</p>
              
              {p.discount > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 mb-4">
                  <Tag size={12} className="fill-emerald-600" />
                  <span className="text-[10px] font-black uppercase">{p.discount}% OFF Applied</span>
                </div>
              )}

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs. {p.price - (p.price * (p.discount || 0) / 100)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Stock</p>
                  <p className={`font-black ${p.qty < 10 ? 'text-rose-500' : 'text-slate-800'}`}>{p.qty} Units</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- ADD / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <h2 className="text-2xl font-black uppercase italic mb-8">{editingProduct ? 'Edit' : 'Add'} <span className="text-indigo-600">Product</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Product Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                <input type="number" placeholder="Quantity" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-2 block">Discount (%) - Admin Only</label>
                <input type="number" placeholder="0" className="w-full bg-transparent outline-none font-black text-emerald-700" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-indigo-100 transition-transform active:scale-95">
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
