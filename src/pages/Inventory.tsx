import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // User Role Check
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Error loading data"); }
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
      qty: Number(formData.get('qty')), 
      discount: Number(formData.get('discount') || 0) 
    };

    try {
      if (editingProduct) {
        if (!isAdmin) { toast.error("Staff cannot edit products!"); return; }
        await axios.put(`/api/products/${editingProduct._id}`, data, { headers: { 'user-role': user.role } });
      } else {
        await axios.post('/api/products', data); // Staff can add
      }
      setIsModalOpen(false);
      fetchProducts();
      toast.success("Inventory Updated!");
    } catch (err) { toast.error("Permission Denied or Server Error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
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
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            <Plus size={18} /> Add New Product
          </button>
        </div>
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 border border-slate-100"><input type="text" placeholder="Search by name or code..." className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold text-slate-600" onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-auto p-6 border border-slate-100">
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
                      {/* Only Admin can Edit or Delete */}
                      {isAdmin && (
                        <>
                          <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
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

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-8 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500"><X size={24}/></button>
              <h2 className="text-xl font-black mb-6 uppercase italic text-indigo-600">{editingProduct ? 'Edit Existing Item' : 'Add New Inventory'}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-indigo-100" />
                <input name="code" placeholder="Barcode / Code" defaultValue={editingProduct?.code} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-indigo-100" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Qty</label><input name="qty" type="number" placeholder="0" defaultValue={editingProduct?.qty} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Price</label><input name="price" type="number" placeholder="0.00" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Disc %</label><input name="discount" type="number" placeholder="0" defaultValue={editingProduct?.discount} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" /></div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-xs hover:bg-slate-200">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200">
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
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
