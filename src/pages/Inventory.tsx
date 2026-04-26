import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/products?businessId=${user.businessId}`);
        setProducts(res.data);
      } catch (err) { toast.error("Error loading products"); }
    };
    if(user.businessId) fetch();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black italic uppercase">Inventory <span className="text-indigo-600">Stock</span></h1>
          <input type="text" placeholder="Search..." className="p-3 bg-white rounded-xl border-none shadow-sm font-bold w-64" onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.filter((p:any) => p.name.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><Package size={20}/></div>
              <p className="text-[10px] font-black text-slate-300 uppercase">{p.code}</p>
              <h3 className="font-black text-slate-800 uppercase italic">{p.name}</h3>
              <div className="flex justify-between mt-4">
                <p className="font-black text-indigo-600">Rs. {p.price}</p>
                <p className="font-black text-slate-400">Qty: {p.qty}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Inventory;
