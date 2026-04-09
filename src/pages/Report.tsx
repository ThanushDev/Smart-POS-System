import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Report = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. සැබෑ විකුණුම් දත්ත (Invoices) ලබා ගැනීම
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // දින අනුව විකුණුම් එකතුව සකස් කිරීම
    const salesMap: { [key: string]: number } = {};
    savedInvoices.forEach((inv: any) => {
      const dateKey = inv.date; // e.g., "2024-03-20"
      salesMap[dateKey] = (salesMap[dateKey] || 0) + inv.total;
    });

    const processedSales = Object.keys(salesMap).map(date => ({
      name: date,
      total: salesMap[date]
    })).sort((a, b) => a.name.localeCompare(b.name));

    setSalesData(processedSales);

    // 2. සැබෑ තොග දත්ත (Products) ලබා ගැනීම
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const processedProducts = savedProducts.map((p: any) => ({
      name: p.name,
      total: p.qty
    }));

    setProductData(processedProducts);
    setIsLoading(false);
  }, []);

  const currentData = activeTab === 'sales' ? salesData : productData;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Analytics & Reports</h1>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('sales')}
              className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'sales' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Sales Overview
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Products Overview
            </button>
          </div>

          <div className="p-8 h-[450px] flex items-center justify-center">
            {isLoading ? (
               <p className="text-slate-400">Loading data...</p>
            ) : currentData.length === 0 ? (
              // දත්ත නොමැති විට පෙන්වන පණිවිඩය
              <div className="text-center space-y-2">
                <div className="text-slate-300 flex justify-center mb-4">
                   <BarChart width={50} height={50} data={[{v:1}]}><Bar dataKey=\"v\" fill=\"#e2e8f0\"/></BarChart>
                </div>
                <p className="text-slate-500 font-medium italic">No data available to display</p>
                <p className="text-slate-400 text-sm">Once you add products or make sales, they will appear here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'sales' ? (
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                ) : (
                  <BarChart data={productData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
