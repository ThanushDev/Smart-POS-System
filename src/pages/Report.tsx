import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const Report = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/invoices?businessId=${user.businessId}`);
        const salesMap: any = {};
        
        res.data.forEach((inv: any) => {
          const date = new Date(inv.date).toLocaleDateString();
          salesMap[date] = (salesMap[date] || 0) + inv.total;
        });

        const processed = Object.keys(salesMap).map(date => ({
          name: date,
          total: salesMap[date]
        })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

        setSalesData(processed);
      } catch (err) {
        console.error("Report Fetch Error:", err);
      }
    };
    if(user.businessId) fetchReport();
  }, [user.businessId]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black italic uppercase">Sales <span className="text-indigo-600">Analytics</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Growth Metrics</p>
        </header>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#4f46e5" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Report;
