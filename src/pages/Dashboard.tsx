import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayBills: 0, monthBills: 0, todayIncome: 0, monthIncome: 0,
    totalProducts: 0, lowStockCount: 0, totalStockValue: 0, lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`/api/dashboard/stats?businessId=${user.businessId}`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.businessId]);

  useEffect(() => { if(user.businessId) fetchStats(); }, [fetchStats]);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Control <span className="text-indigo-400">Center</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Operations</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <DollarSign className="text-indigo-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400">Income Today</p>
            <h2 className="text-3xl font-black italic">Rs. {stats.todayIncome.toLocaleString()}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <ShoppingCart className="text-emerald-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400">Bills Today</p>
            <h2 className="text-3xl font-black italic">{stats.todayBills}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <Package className="text-amber-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400">Total Items</p>
            <h2 className="text-3xl font-black italic">{stats.totalProducts}</h2>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem]">
            <AlertTriangle className="text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-rose-400">Low Stock</p>
            <h2 className="text-3xl font-black italic text-rose-500">{stats.lowStockCount}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[3rem]">
            <h3 className="font-black italic uppercase mb-6 text-slate-400">Stock Alerts</h3>
            <div className="space-y-3">
              {stats.lowStockItems.length > 0 ? stats.lowStockItems.map((item: any) => (
                <div key={item._id} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5 font-bold italic">
                  <span>{item.name}</span>
                  <span className="text-rose-500">{item.qty} left</span>
                </div>
              )) : <p className="text-slate-500 font-bold italic uppercase">All stock levels are healthy</p>}
            </div>
          </div>
          <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-xl shadow-indigo-500/10">
             <h3 className="font-black italic uppercase mb-6 underline decoration-white/20 underline-offset-4">Quick Links</h3>
             <div className="space-y-3">
                <button onClick={() => window.location.href='/pos'} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black uppercase italic">POS System</button>
                <button onClick={() => window.location.href='/inventory'} className="w-full bg-white/10 py-4 rounded-2xl font-bold uppercase italic border border-white/10">Inventory</button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
