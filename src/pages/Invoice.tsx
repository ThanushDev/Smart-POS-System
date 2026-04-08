import React from 'react';
import Sidebar from '../components/Sidebar';
import { Eye, Printer, Search } from 'lucide-react';

const Invoice = () => {
  const invoices = [
    { id: 'INV-829102', date: '2026-05-20', time: '14:30', total: 43650.50 },
    { id: 'INV-829101', date: '2026-05-20', time: '12:15', total: 12600.00 },
    { id: 'INV-829100', date: '2026-05-19', time: '18:45', total: 63075.25 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Invoice History</h1>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search invoice number..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.id}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.time}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Rs. {inv.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Reprint">
                        <Printer size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Invoice;