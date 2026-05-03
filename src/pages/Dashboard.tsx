import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  // Stats වලට default values දීලා තියෙන්නේ crash එක වළක්වන්න
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
      // API එකෙන් data ආවේ නැත්නම් පරණ stats ම තියාගන්නවා
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
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Control <span className="text-indigo-400">Center</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Revenue Today Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <DollarSign className="text-indigo-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Revenue Today</p>
            <h2 className="text-3xl font-black italic">
              {/* මෙතන (Number(...) || 0) දැමීමෙන් crash වීම වළක්වයි */}
              Rs. {(Number(stats?.todayIncome) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Total Sales Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <ShoppingCart className="text-emerald-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Bills</p>
            <h2 className="text-3xl font-black italic">
              {stats?.todayBills || 0}
            </h2>
          </div>

          {/* Stock Items Card */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <Package className="text-amber-400 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Stock Items</p>
            <h2 className="text-3xl font-black italic">
              {stats?.totalProducts || 0}
            </h2>
          </div>

          {/* Low Stock Card */}
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2.5rem]">
            <AlertTriangle className="text-rose-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Low Stock</p>
            <h2 className="text-3xl font-black italic text-rose-500">
              {stats?.lowStockCount || 0}
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
