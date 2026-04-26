import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const Report = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchReport = async () => {
      const res = await axios.get(`/api/invoices?businessId=${user.businessId}`);
      const salesMap: any = {};
      res.data.forEach((inv: any) => {
        const date = new Date(inv.date).toLocaleDateString();
        salesMap[date] = (salesMap[date] || 0) + inv.total;
      });
      const processed = Object.keys(salesMap).map(date => ({ name: date, total: salesMap[date] }));
      setSalesData(processed);
    };
    fetchReport();
  }, [user.businessId]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-black italic uppercase mb-10">Sales <span className="text-indigo-600">Analytics</span></h1>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 h-[500px]">
          <ResponsiveContainer width=\"100%\" height=\"100%\">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray=\"3 3\" vertical={false} stroke=\"#f1f5f9\" />
              <XAxis dataKey=\"name\" tick={{fontSize: 12, fontWeight: 'bold'}} />
              <YAxis tick={{fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip />
              <Line type=\"monotone\" dataKey=\"total\" stroke=\"#4f46e5\" strokeWidth={4} dot={{r: 6, fill: '#4f46e5'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};
export default Report;
