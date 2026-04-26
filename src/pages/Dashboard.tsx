import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, Calendar, ShoppingBag, ShoppingCart, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(window.location.origin);

const Dashboard = () => {
  const [stats, setStats] = useState({ todayBills: 0, monthBills: 0, todayIncome: 0, monthIncome: 0, totalProducts: 0, lowStockCount: 0, totalStockValue: 0, lowStockItems: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.businessId) return;
      const res = await axios.get(`/api/dashboard/stats?businessId=${user.businessId}`);
      if (res.data) setStats(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    socket.on('update-sync', () => fetchStats());
    const interval = setInterval(fetchStats, 30000); 
    return () => { socket.off('update-sync'); clearInterval(interval); };
  }, [fetchStats]);

  const statCards = [
    { title: "Today's Income", value: `Rs. ${(stats.todayIncome || 0).toLocaleString()}`, icon: <DollarSign />, color: 'bg-emerald-500' },
    { title: "Monthly Income", value: `Rs. ${(stats.monthIncome || 0).toLocaleString()}`, icon: <Calendar />, color: 'bg-indigo-500' },
    { title: "Stock Value", value: `Rs. ${(stats.totalStockValue || 0).toLocaleString()}`, icon: <Package />, color: 'bg-blue-500' },
    { title: "Low Stock", value: stats.lowStockCount || 0, icon: <AlertTriangle />, color: 'bg-rose-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">DIGI SOLUTIONS <span className="text-indigo-600">DASHBOARD</span></h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">Real-time Performance Intelligence</p>
          </div>
          <button onClick={fetchStats} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 relative group hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}>{card.icon}</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">{card.title}</p>
                  <p className="text-xl font-black text-slate-800 leading-tight">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100">
            <h2 className="text-xl font-black italic text-slate-800 uppercase mb-8">Inventory Alert</h2>
            <div className="space-y-3">
              {stats.lowStockItems.length > 0 ? stats.lowStockItems.map((item: any) => (
                <div key={item._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100">
                  <div className="font-black text-slate-800 uppercase text-xs">{item.name}</div>
                  <div className="text-rose-600 font-black italic">{item.qty} Left</div>
                </div>
              )) : <p className="text-center text-slate-300 font-bold italic uppercase py-10">All stock perfect</p>}
            </div>
          </div>
          <div className="bg-indigo-600 rounded-[3rem] p-8 text-white flex flex-col justify-between min-h-[300px]">
            <h2 className="text-lg font-black uppercase italic underline decoration-indigo-300">Quick Actions</h2>
            <div className="space-y-4">
              <button onClick={() => window.location.href = '/new-bill'} className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black uppercase text-xs shadow-lg">New Bill</button>
              <button onClick={() => window.location.href = '/report'} className="w-full bg-white/10 py-5 rounded-2xl font-bold uppercase text-xs border border-white/20">Sales Report</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
