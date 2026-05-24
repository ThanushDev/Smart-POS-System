import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayBills: 0, 
    monthBills: 0, 
    todayIncome: 0, 
    monthIncome: 0,
    totalProducts: 0, 
    lowStockCount: 0, 
    totalStockValue: 0, 
    lowStockItems: []
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`/api/dashboard/stats?businessId=${user.businessId}`);
      if (res.data) {
        setStats(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) { 
      console.error("Sync Error:", err); 
    }
  }, [user.businessId]);

  useEffect(() => { 
    if(user.businessId) fetchStats(); 
  }, [fetchStats]);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      <Sidebar />
      {/* pt-16 md:pt-0 => mobile top bar height ekkata gap hadanawa */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
            Control <span className="text-indigo-400">Center</span>
          </h1>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {/* Revenue Today Card */}
          <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
            <DollarSign className="text-indigo-400 mb-3 md:mb-4" size={28} />
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Revenue Today</p>
            <h2 className="text-xl md:text-3xl font-black italic">
              Rs. {(Number(stats?.todayIncome) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Total Bills Card */}
          <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
            <ShoppingCart className="text-emerald-400 mb-3 md:mb-4" size={28} />
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Total Bills</p>
            <h2 className="text-xl md:text-3xl font-black italic">
              {stats?.todayBills || 0}
            </h2>
          </div>

          {/* Stock Items Card */}
          <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
            <Package className="text-amber-400 mb-3 md:mb-4" size={28} />
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Stock Items</p>
            <h2 className="text-xl md:text-3xl font-black italic">
              {stats?.totalProducts || 0}
            </h2>
          </div>

          {/* Low Stock Card */}
          <div className="bg-rose-500/10 border border-rose-500/20 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
            <AlertTriangle className="text-rose-500 mb-3 md:mb-4" size={28} />
            <p className="text-[9px] md:text-[10px] font-black uppercase text-rose-400 mb-1">Low Stock</p>
            <h2 className="text-xl md:text-3xl font-black italic text-rose-500">
              {stats?.lowStockCount || 0}
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
