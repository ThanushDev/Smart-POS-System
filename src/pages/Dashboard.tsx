import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Package, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    totalProducts: 0,
    lowStock: 0
  });

  const fetchStats = async () => {
    try {
      // Backend එකෙන් අලුත්ම දත්ත ගන්නවා
      const [invRes, prodRes] = await Promise.all([
        axios.get('/api/invoices'),
        axios.get('/api/products')
      ]);

      const invoices = invRes.data;
      const products = prodRes.data;

      // ගණන් හිලව් සෑදීම
      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      const lowStockItems = products.filter((p: any) => (p.qty || 0) <= 5).length;

      setStats({
        totalSales: totalRevenue,
        totalInvoices: invoices.length,
        totalProducts: products.length,
        lowStock: lowStockItems
      });
    } catch (err) {
      console.error("Dashboard data load error");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase italic text-slate-800">
          Live <span className="text-indigo-600">Statistics</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time business insights</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
          <p className="text-[10px] font-black uppercase text-slate-400">Total Revenue</p>
          <h2 className="text-2xl font-black text-slate-800 font-mono">Rs. {stats.totalSales.toLocaleString()}</h2>
        </div>

        {/* Invoices Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><ShoppingBag size={24} /></div>
          <p className="text-[10px] font-black uppercase text-slate-400">Bills Issued</p>
          <h2 className="text-2xl font-black text-slate-800">{stats.totalInvoices}</h2>
        </div>

        {/* Stock Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Package size={24} /></div>
          <p className="text-[10px] font-black uppercase text-slate-400">Items in Stock</p>
          <h2 className="text-2xl font-black text-slate-800">{stats.totalProducts}</h2>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-transform hover:scale-105">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
          <p className="text-[10px] font-black uppercase text-slate-400">Low Stock Warning</p>
          <h2 className="text-2xl font-black text-slate-800 text-rose-600">{stats.lowStock}</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
