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
      // businessId eka pass karana eka thama wadagathma
      const res = await axios.get(`/api/dashboard/stats?businessId=${user.businessId}`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user.businessId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Control <span className="text-indigo-400">Center</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Real-time Business Intelligence</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
              <DollarSign className="text-indigo-400 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Today's Revenue</p>
              <h2 className="text-3xl font-black italic">Rs. {stats.todayIncome.toLocaleString()}</h2>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
              <ShoppingCart className="text-emerald-400 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Sales</p>
              <h2 className="text-3xl font-black italic">{stats.todayBills}</h2>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
              <Package className="text-amber-400 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Inventory Items</p>
              <h2 className="text-3xl font-black italic">{stats.totalProducts}</h2>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem]">
              <AlertTriangle className="text-rose-500 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Low Stock</p>
              <h2 className="text-3xl font-black italic text-rose-500">{stats.lowStockCount}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-10 rounded-[3.5rem]">
              <h2 className="text-xl font-black italic uppercase mb-8">Stock <span className="text-indigo-400">Alerts</span></h2>
              <div className="space-y-4">
                {stats.lowStockItems.map((item: any) => (
                  <div key={item._id} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                    <span className="font-bold uppercase italic text-sm">{item.name}</span>
                    <span className="bg-rose-500 text-white px-4 py-1 rounded-full font-black text-[10px]">{item.qty} LEFT</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-600 p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-500/20">
               <h2 className="text-xl font-black mb-8 italic uppercase underline decoration-white/20 underline-offset-8">Quick Actions</h2>
               <div className="space-y-4">
                  <button onClick={() => window.location.href='/pos'} className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3">
                    <ShoppingCart size={20}/> POS SYSTEM
                  </button>
                  <button onClick={() => window.location.href='/inventory'} className="w-full bg-white/10 hover:bg-white/20 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 border border-white/10 transition-all">
                    <Package size={20}/> INVENTORY
                  </button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
