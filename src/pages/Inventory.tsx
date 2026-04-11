import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Edit3, Trash2, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error("Only Admins can delete items!");
      return;
    }
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: { 'user-role': user.role }
        });
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
              <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 bg-white rounded-xl border-none outline-none shadow-sm font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {isAdmin && <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"><Plus size={18}/> Add Item</button>}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={16}/></button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                  )}
                </div>
              </div>
              <h3 className="font-black uppercase text-sm mb-1">{p.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-4">CODE: {p.code}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs. {p.price}</p>
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
    </div>
  );
};

export default Inventory;
