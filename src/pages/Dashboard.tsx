import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, AlertTriangle, TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

const Dashboard = () => {
  const [stats, setStats] = useState<any>({
    todayBills: 0,
    monthBills: 0,
    todayIncome: 0,
    monthIncome: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalStockValue: 0,
    lowStockItems: []
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetching failed");
    }
  };

  useEffect(() => {
    fetchStats();

    // Real-time Sync: බිලක් ගැසූ සැණින් Dashboard එක Update වේ
    socket.on('update-sync', () => {
      fetchStats();
    });

    return () => { socket.off('update-sync'); };
  }, []);

  const statCards = [
    { title: "Today's Income", value: `Rs. ${stats.todayIncome.toLocaleString()}`, sub: `${stats.todayBills} Bills Today`, icon: <DollarSign />, color: 'bg-emerald-500' },
    { title: "Monthly Income", value: `Rs. ${stats.monthIncome.toLocaleString()}`, sub: `${stats.monthBills} Bills this Month`, icon: <Calendar />, color: 'bg-indigo-500' },
    { title: "Total Stock Value", value: `Rs. ${stats.totalStockValue.toLocaleString()}`, sub: `${stats.totalProducts} Total Products`, icon: <Package />, color: 'bg-blue-500' },
    { title: "Low Stock Alert", value: stats.lowStockCount, sub: "Items need restock", icon: <AlertTriangle />, color: 'bg-rose-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">DIGI SOLUTIONS DASHBOARD</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Business Performance Intelligence</p>
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
                  <p className="text-xl font-black text-slate-800 leading-tight">{card.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{card.sub}</p>
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${card.color} opacity-5 rounded-full`}></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Low Stock Detailed List */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h2 className="text-xl font-black italic text-slate-800 uppercase">Inventory Shortage</h2>
              <span className="bg-rose-100 text-rose-600 px-4 py-1 rounded-full text-[10px] font-black">URGENT ACTION</span>
            </div>
            
            <div className="space-y-4">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.map((item: any) => (
                  <div key={item._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">CODE: {item.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.qty === 0 ? 'text-rose-600' : 'text-orange-500'}`}>
                        {item.qty}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Available</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold italic">Stock levels are perfect. No items low on stock!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Shortcuts */}
          <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-xl shadow-indigo-200">
            <h2 className="text-xl font-black mb-8 italic">QUICK ACTIONS</h2>
            <div className="space-y-4">
              <button className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/10">
                <TrendingUp size={18} /> View Sales Report
              </button>
              <button className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-indigo-800/20">
                <ShoppingCart size={18} /> Create New Bill
              </button>
            </div>
            
            <div className="mt-12 bg-white/10 p-6 rounded-[2rem] border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Message</p>
              <p className="mt-2 text-sm font-medium">Your Digi Solutions POS is connected to MongoDB and syncing live.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
