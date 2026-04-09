import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Report = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Invoices කියවා විකුණුම් වාර්තා සකස් කිරීම
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    
    // සරලව දින කිහිපයක දත්ත මෙහිදී සකස් කළ හැක (මෙය ඔබේ අවශ්‍යතාවය අනුව වෙනස් කළ හැක)
    const processedSales = savedInvoices.map((inv: any) => ({
      name: inv.date.split('-').slice(1).join('/'), // දිනය කෙටියෙන්
      total: inv.total
    }));
    setSalesData(processedSales);

    // 2. Inventory කියවා භාණ්ඩ වාර්තා සකස් කිරීම
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const processedProducts = savedProducts.map((p: any) => ({
      name: p.name,
      total: p.qty
    }));
    setProductData(processedProducts);
  }, []);

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

          <div className="p-8 h-[400px]">
            {/* දත්ත නොමැති නම් පෙන්වන පණිවිඩය */}
            {(activeTab === 'sales' ? salesData : productData).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No data available to display in charts.</p>
                <p className="text-sm">Please make some transactions first.</p>
              </div>
            ) : (
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                {activeTab === 'sales' ? (
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" />
                    <XAxis dataKey=\"name\" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type=\"monotone\" dataKey=\"total\" stroke=\"#4f46e5\" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                  </LineChart>
                ) : (
                  <BarChart data={productData}>
                    <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" />
                    <XAxis dataKey=\"name\" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey=\"total\" fill=\"#6366f1\" radius={[4, 4, 0, 0]} />
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
