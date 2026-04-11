import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  // 1. Data එකතු කරගන්න state එක
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    totalProducts: 0,
    lowStock: 0
  });

  // 2. Backend එකෙන් දත්ත ගෙනල්ලා Count එක හදන Function එක
  const fetchLiveStats = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        axios.get('/api/invoices'),
        axios.get('/api/products')
      ]);

      const invoices = invRes.data;
      const products = prodRes.data;

      const revenue = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      const lowStockCount = products.filter((p: any) => (p.qty || 0) <= 5).length;

      setStats({
        totalSales: revenue,
        totalInvoices: invoices.length,
        totalProducts: products.length,
        lowStock: lowStockCount
      });
    } catch (err) {
      console.error("Live Data Fetch Error");
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  return (
    <div className="p-10">
      {/* Header කොටස (කලින් තිබ්බ විදිහටම) */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg">
          <LayoutDashboard size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase italic text-slate-800 leading-none">
            Business <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Live Engine Statistics</p>
        </div>
      </div>

      {/* Stats Cards (කලින් තිබ්බ Interface එක) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Revenue</p>
            <h2 className="text-2xl font-black text-slate-800">Rs. {stats.totalSales.toLocaleString()}</h2>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Invoices Issued</p>
            <h2 className="text-2xl font-black text-slate-800">{stats.totalInvoices}</h2>
          </div>
        </div>

        {/* Inventory Items */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items In Stock</p>
            <h2 className="text-2xl font-black text-slate-800">{stats.totalProducts}</h2>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Low Stock Items</p>
            <h2 className="text-2xl font-black text-rose-600">{stats.lowStock}</h2>
          </div>
        </div>

      </div>

      {/* පහළින් තව මොනවා හරි (Charts/Tables) කලින් තිබ්බා නම් ඒ ටික මෙතනට දාගන්න */}
    </div>
  );
};

export default Dashboard;
