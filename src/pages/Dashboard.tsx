import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, Calendar, ShoppingBag, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Socket connection - window.location.origin පාවිච්චි කිරීමෙන් production එකේදීත් ලේසියෙන් connect වෙනවා
const socket = io(window.location.origin);

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

  const [loading, setLoading] = useState(true);

  // 1. දත්ත ලබාගැනීමේ ප්‍රධාන Function එක (useCallback පාවිච්චි කරලා performance වැඩිකලා)
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // පළමු වතාවට data load කිරීම
    fetchStats();

    // 2. REAL-TIME UPDATE (Socket): වෙනත් window එකකින් බිලක් ගැසූ විට update වීම
    socket.on('update-sync', () => {
      console.log("Real-time sync triggered!");
      fetchStats();
    });

    // 3. SAFETY AUTO-REFRESH: තත්පර 30 කට වරක් නිකන්ම data refresh වීම (Socket fail වුණොත් මේක වැඩ)
    const interval = setInterval(fetchStats, 30000); 
    
    return () => {
      socket.off('update-sync');
      clearInterval(interval);
    };
  }, [fetchStats]);

  const statCards = [
    { title: "Today's Income", value: `Rs. ${(stats.todayIncome || 0).toLocaleString()}`, sub: `${stats.todayBills || 0} Bills Today`, icon: <DollarSign />, color: 'bg-emerald-500' },
    { title: "Monthly Income", value: `Rs. ${(stats.monthIncome || 0).toLocaleString()}`, sub: `${stats.monthBills || 0} Bills this Month`, icon: <Calendar />, color: 'bg-indigo-500' },
    { title: "Total Stock Value", value: `Rs. ${(stats.totalStockValue || 0).toLocaleString()}`, sub: `${stats.totalProducts || 0} Total Products`, icon: <Package />, color: 'bg-blue-500' },
    { title: "Low Stock Alert", value: stats.lowStockCount || 0, sub: "Items need restock", icon: <AlertTriangle />, color: 'bg-rose-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">
                DIGI SOLUTIONS <span className="text-indigo-600">DASHBOARD</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Business Performance Intelligence</p>
          </div>
          {/* Live indicator එකක් දැම්මා වැඩ කරනවාද බලන්න */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-black uppercase text-slate-400">Live Syncing</span>
          </div>
        </header>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center gap-5 relative z-10">
                <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                  <p className="text-xl font-black text-slate-800 leading-tight">
                    {loading && stats.todayIncome === 0 ? "..." : card.value}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{card.sub}</p>
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${card.color} opacity-5 rounded-full`}></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h2 className="text-xl font-black italic text-slate-800 uppercase">Inventory Shortage</h2>
              <span className="bg-rose-100 text-rose-600 px-4 py-1 rounded-full text-[10px] font-black">URGENT ACTION</span>
            </div>
            
            <div className="space-y-4">
              {stats.lowStockItems && stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.map((item: any) => (
                  <div key={item._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black italic">
                        {item.name ? item.name.charAt(0) : "P"}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">SKU: {item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.qty <= 0 ? 'text-rose-600' : 'text-orange-500'}`}>
                        {item.qty}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Left</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                    {loading ? "Checking Database..." : "All stock levels are perfect!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Column */}
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h2 className="text-xl font-black mb-8 italic uppercase tracking-tighter underline decoration-indigo-400 underline-offset-8">QUICK ACTIONS</h2>
                <div className="space-y-4">
                  <button onClick={() => window.location.href = '/report'} className="w-full bg-white/10 hover:bg-white/20 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/10 uppercase text-xs tracking-widest group">
                    <TrendingUp size={18} className="group-hover:translate-x-1 transition-transform" /> Sales Report
                  </button>
                  <button onClick={() => window.location.href = '/new-bill'} className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">
                    <ShoppingCart size={18} /> Generate Bill
                  </button>
                </div>
              </div>
              <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10 mt-6">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">Cloud Status</p>
                <p className="mt-2 text-sm font-bold uppercase tracking-tighter italic">
                  {loading ? "Refreshing..." : "Systems Fully Operational"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
