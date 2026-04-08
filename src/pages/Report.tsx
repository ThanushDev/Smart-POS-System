import React, { useState } from 'react';
    import Sidebar from '../components/Sidebar';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

    const Report = () => {
      const [activeTab, setActiveTab] = useState('sales');

      const salesData = [
        { name: 'Mon', total: 4000 },
        { name: 'Tue', total: 3000 },
        { name: 'Wed', total: 2000 },
        { name: 'Thu', total: 2780 },
        { name: 'Fri', total: 1890 },
        { name: 'Sat', total: 2390 },
        { name: 'Sun', total: 3490 },
      ];

      return (
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Analytics & Reports</h1>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button 
                  onClick={() => setActiveTab('sales')}
                  className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'sales' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sales Overview
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Product Sales
                </button>
              </div>

              <div className="p-8">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'sales' ? (
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    };

    export default Report;