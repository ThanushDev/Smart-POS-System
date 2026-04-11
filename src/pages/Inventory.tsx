import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2, Search, X, Package, Hash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Error loading data"); }
  };

  useEffect(() => {
    fetchProducts();
    socket.on('update-sync', fetchProducts);
    return () => { socket.off('update-sync'); };
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = { name: formData.get('name'), code: formData.get('code'), price: Number(formData.get('price')), qty: Number(formData.get('qty')), discount: Number(formData.get('discount') || 0) };
    try {
      editingProduct ? await axios.put(`/api/products/${editingProduct._id}`, data) : await axios.post('/api/products', data);
      socket.emit('update-data');
      setIsModalOpen(false);
      fetchProducts();
      toast.success("Success!");
    } catch (err) { toast.error("Error saving product"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return toast.error("Admin only!");
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
        socket.emit('update-data');
        fetchProducts();
        toast.success("Deleted");
      } catch (err) { toast.error("Failed"); }
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Inventory</h1>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase"><Plus size={18} /> Add Product</button>
        </div>
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 border border-slate-100"><input type="text" placeholder="Search..." className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold" onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead><tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest"><th className="px-6 py-2">Details</th><th className="px-6 py-2">Code</th><th className="px-6 py-2">Stock</th><th className="px-6 py-2">Price</th><th className="px-6 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} className="bg-slate-50 hover:bg-white transition-all group">
                  <td className="px-6 py-4 rounded-l-2xl font-black uppercase text-sm">{p.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-500 text-xs">{p.code}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.qty < 10 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.qty} IN STOCK</span></td>
                  <td className="px-6 py-4 font-black">Rs. {p.price}</td>
                  <td className="px-6 py-4 rounded-r-2xl text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-indigo-600"><Edit2 size={16} /></button>
                      {isAdmin && <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500"><Trash2 size={16} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-8">
              <h2 className="text-xl font-black mb-6 uppercase">{editingProduct ? 'Edit' : 'Add'} Product</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input name="code" placeholder="Code" defaultValue={editingProduct?.code} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="qty" type="number" placeholder="Qty" defaultValue={editingProduct?.qty} required className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="discount" type="number" placeholder="Disc %" defaultValue={editingProduct?.discount} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
