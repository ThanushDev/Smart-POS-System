import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Receipt, Calendar, Download } from 'lucide-react';

const Report = () => {
  const [invoices, setInvoices] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchInvoices = async () => {
      const res = await axios.get(`/api/invoices?businessId=${user.businessId}`);
      setInvoices(res.data);
    };
    fetchInvoices();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-black italic uppercase">Sales <span className="text-indigo-600">Reports</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History of all transactions</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {invoices.map((inv: any) => (
            <div key={inv._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Receipt size={24}/>
                </div>
                <div>
                  <p className="font-black text-slate-800 uppercase tracking-tighter">{inv.invoiceId}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase"><Calendar size={10}/> {inv.date}</p>
                </div>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase">Cashier</p>
                 <p className="font-bold text-xs uppercase italic">{inv.cashier}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-indigo-600">Rs. {inv.total.toLocaleString()}</p>
                <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1 uppercase transition-colors"><Download size={10}/> Receipt</button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && <div className="py-20 text-center font-black text-slate-300 italic uppercase">No invoices found.</div>}
        </div>
      </main>
    </div>
  );
};
export default Report;
