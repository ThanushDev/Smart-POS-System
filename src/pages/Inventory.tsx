import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Error loading products"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = { 
      name: formData.get('name'), 
      code: formData.get('code'), 
      price: Number(formData.get('price')), 
      qty: Number(formData.get('qty'))
    };

    try {
      if (editingProduct) {
        if (!isAdmin) { toast.error("Staff members cannot edit products!"); return; }
        await axios.put(`/api/products/${editingProduct._id}`, data, { headers: { 'user-role': user.role } });
      } else {
        await axios.post('/api/products', data); // Staff members CAN add
      }
      setIsModalOpen(false);
      fetchProducts();
      toast.success("Inventory updated successfully!");
    } catch (err) { toast.error("Action failed"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Permanent delete?")) {
      try {
        await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
        fetchProducts();
        toast.success("Deleted");
      } catch (err) { toast.error("Failed"); }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Inventory</h1>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-2">Item</th><th className="px-6 py-2">Stock</th><th className="px-6 py-2">Price</th><th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="bg-slate-50 hover:bg-white transition-all group">
                  <td className="px-6 py-4 rounded-l-2xl font-black uppercase text-sm">{p.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-500">{p.qty}</td>
                  <td className="px-6 py-4 font-black text-indigo-600">Rs. {p.price}</td>
                  <td className="px-6 py-4 rounded-r-2xl text-right">
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-indigo-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500"><Trash2 size={16} /></button>
                        </>
                      )}
                      {!isAdmin && <span className="text-[10px] font-bold text-slate-300 italic">Locked</span>}
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
              <h2 className="text-xl font-black mb-6 uppercase text-indigo-600">{editingProduct ? 'Edit' : 'New'} Item</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input name="name" placeholder="Name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input name="code" placeholder="Code" defaultValue={editingProduct?.code} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="qty" type="number" placeholder="Qty" defaultValue={editingProduct?.qty} required className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase">Save</button>
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
