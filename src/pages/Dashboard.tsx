import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Wallet, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Clock,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockProducts = [
    { id: '1', name: 'Organic Coffee Beans', code: 'PRD-001', qty: 5, price: 7500.00 },
    { id: '2', name: 'Almond Milk 1L', code: 'PRD-042', qty: 2, price: 1350.00 },
    { id: '3', name: 'Whole Wheat Bread', code: 'PRD-015', qty: 8, price: 450.00 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Business Overview</h1>
            <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={18} className="text-indigo-500" />
              <span className="font-medium text-sm">{format(currentTime, 'eeee, do MMMM')}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-900">
              <Clock size={18} className="text-indigo-500" />
              <span className="font-mono font-bold text-sm">{format(currentTime, 'hh:mm:ss a')}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <StatCard icon={Receipt} label="Total Bills Today" value="42" color="bg-blue-500" />
          <StatCard icon={Wallet} label="Today's Income" value="Rs. 372,150.00" color="bg-emerald-500" />
          <StatCard icon={TrendingUp} label="Monthly Income" value="Rs. 10,446,000.00" color="bg-indigo-500" />
          <StatCard icon={Package} label="Total Products" value="1,248" color="bg-amber-500" />
          <StatCard icon={AlertTriangle} label="Low Stock" value="12" color="bg-rose-500" />
        </div>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Low Stock Products</h2>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full uppercase tracking-wider">
              Action Required
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Product Code</th>
                  <th className="px-6 py-4 font-semibold">Current Qty</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockProducts.map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{product.code}</td>
                    <td className="px-6 py-4">
                      <span className="text-rose-600 font-bold">{product.qty}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Rs. {product.price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        Critical
                      </span>
                    </td>
                  </motion.tr>
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