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

  const openModal = (product: any = null) => {
    if (product) {
      // Edit mode - මෙතැනට එන්නේ Admin විතරයි (UI එකෙන් අපි බ්ලොක් කරලා තියෙන්නේ)
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price, qty: product.qty, discount: product.discount || 0 });
    } else {
      // Add mode - හැමෝටම පුළුවන්
      setEditingProduct(null);
      setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { 'user-role': user.role } };

    try {
      if (editingProduct) {
        // Edit කරන්නේ Admin ද බලනවා
        if (!isAdmin) return toast.error("Only Admin can edit!");
        await axios.put(`/api/products/${editingProduct._id}`, formData, config);
        toast.success("Product Updated");
      } else {
        // Add කරන්න ඕනෑම කෙනෙක්ට (Admin/Staff) පුළුවන්
        await axios.post('/api/products', formData, config);
        toast.success("Product Added Successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Operation failed!"); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
        toast.success("Product removed");
        fetchProducts();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

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
            {/* ADD ITEM - මේ බටන් එක හැමෝටම පේනවා */}
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
              <Plus size={18}/> Add Item
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {/* EDIT/DELETE - මේවා පේන්නේ ඇඩ්මින්ට විතරයි */}
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
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs.{p.price - (p.price * (p.discount || 0) / 100)}</p>
                </div>
                <div className="text-right font-black">Stock: {p.qty}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL SECTION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
            <h2 className="text-2xl font-black uppercase italic mb-8">{editingProduct ? 'Edit' : 'Add'} Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Product Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                <input type="number" placeholder="Quantity" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
              </div>
              {/* DISCOUNT - මේක Admin ට විතරයි පේන්නේ */}
              {isAdmin && (
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <label className="text-[10px] font-black text-emerald-600 uppercase">Discount (%)</label>
                  <input type="number" className="w-full bg-transparent outline-none font-black text-emerald-700" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
                </div>
              )}
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg">
                {editingProduct ? 'Update Item' : 'Add Item to Stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
