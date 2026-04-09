import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Wallet, TrendingUp, Package, AlertTriangle, Calendar, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

// Stat Card Component for reuse
const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayBills: 0,
    monthBills: 0,
    todayIncome: 0,
    monthIncome: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // සජීවී වේලාව යාවත්කාලීන කිරීම
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // දත්ත ලබා ගැනීම
    fetchDashboardData();
    
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Stats ලබා ගැනීම (MongoDB API)
      const statsRes = await axios.get('/api/dashboard/stats');
      setStats(statsRes.data);

      // 2. Low Stock Products පමණක් වෙනම ලබා ගැනීම 
      // (සටහන: ඔබේ api/dashboard/stats එකේම lowStockItems එවනවා නම් එයද භාවිතා කළ හැක)
      const productsRes = await axios.get('/api/products');
      const lowStock = productsRes.data.filter((p: any) => p.qty <= 5);
      setLowStockProducts(lowStock);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header with Clock */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-600 font-mono">
            <Clock size={18} className="text-indigo-500" />
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard icon={Receipt} label="Total Bills Today" value={stats.todayBills} color="bg-blue-500" />
          <StatCard icon={Calendar} label="Total Bills This Month" value={stats.monthBills} color="bg-indigo-500" />
          <StatCard icon={Wallet} label="Today Income" value={`Rs. ${stats.todayIncome.toLocaleString()}`} color="bg-emerald-500" />
          <StatCard icon={TrendingUp} label="Month Income" value={`Rs. ${stats.monthIncome.toLocaleString()}`} color="bg-orange-500" />
          <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="bg-slate-700" />
          <StatCard icon={AlertTriangle} label="Low Stock Count" value={stats.lowStockCount} color="bg-rose-500" />
        </div>
        
        {/* Low Stock Table */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={24} />
              Low Stock Alerts
            </h2>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase">
              Action Required
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Current Qty</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Fetching live data...</td></tr>
                ) : lowStockProducts.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Stock levels are healthy.</td></tr>
                ) : lowStockProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{product.code}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">{product.qty}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        Critical ( {product.qty} left )
                      </span>
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
