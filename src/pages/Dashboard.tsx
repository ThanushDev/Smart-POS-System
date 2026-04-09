import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Wallet, TrendingUp, Package, AlertTriangle, Clock, Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]); // Sample data ඉවත් කරන ලදී
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchLowStock(); // Database එකෙන් දත්ත ලබා ගැනීම
    return () => clearInterval(timer);
  }, []);

  const fetchLowStock = async () => {
    try {
      const response = await fetch('/api/products/low-stock'); // ඔබේ API එකට අනුව මෙය වෙනස් කරන්න
      if (response.ok) {
        const data = await response.json();
        setLowStockProducts(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Dashboard Overview</h1>
        
        {/* Low Stock Table */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={24} />
              Low Stock Alerts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Qty</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
                ) : lowStockProducts.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No low stock alerts.</td></tr>
                ) : lowStockProducts.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{product.code}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">{product.qty}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Critical</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
