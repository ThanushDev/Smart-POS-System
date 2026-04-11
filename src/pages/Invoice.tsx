import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Calendar, User, CreditCard, Banknote, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Database එකෙන් සියලුම විකුණුම් වාර්තා (Invoices) ලබා ගැනීම
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices');
      // ලැබෙන දත්ත Array එකක් බව තහවුරු කරගනී
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Records load කිරීමට නොහැකි විය!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Invoice ID එකෙන් හෝ Cashier ගේ නමෙන් Search කිරීම
  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.cashier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Sales Records</h1>
          <p className="text-slate-400 text-sm font-bold">Monitor all transactions and cashier activities</p>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex gap-4 items-center border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Invoice ID or Cashier Name..." 
              className="w-full bg-slate-50 pl-12 pr-4 py-3 rounded-xl outline-none font-bold text-slate-600 border border-transparent focus:border-indigo-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-8 px-8 border-l border-slate-100">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoices</p>
                <p className="text-lg font-black text-indigo-600">{filteredInvoices.length}</p>
             </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-hidden flex flex-col border border-slate-100">
          <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse font-black text-slate-300 uppercase italic">Loading Records...</div>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest px-6">
                    <th className="px-6 py-2">Invoice Details</th>
                    <th className="px-6 py-2">Date & Time</th>
                    <th className="px-6 py-2">Cashier / Admin</th>
                    <th className="px-6 py-2">Payment</th>
                    <th className="px-6 py-2 text-right">Discount</th>
                    <th className="px-6 py-2 text-right">Final Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="bg-slate-50 hover:bg-indigo-50/50 transition-all group">
                      {/* Invoice ID */}
                      <td className="px-6 py-4 rounded-l-[1.5rem]">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                            <FileText size={16} />
                          </div>
                          <span className="font-black text-indigo-600 text-sm">#{inv.invoiceId || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                          <Calendar size={14} className="text-slate-400" />
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'N/A'}
                        </div>
                      </td>

                      {/* Cashier Name (වැදගත්ම කොටස) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase italic">
                          <User size={14} className={inv.cashier === 'Admin' ? 'text-rose-500' : 'text-indigo-500'} />
                          {inv.cashier || 'System'}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${inv.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {inv.paymentMethod === 'Cash' ? <Banknote size={12}/> : <CreditCard size={12}/>}
                          {inv.paymentMethod}
                        </div>
                      </td>

                      {/* Discount Amount */}
                      <td className="px-6 py-4 text-right font-bold text-rose-500 text-xs">
                        - Rs. {(inv.discountTotal || 0).toFixed(2)}
                      </td>

                      {/* Final Total */}
                      <td className="px-6 py-4 rounded-r-[1.5rem] text-right">
                        <span className="font-black text-slate-800 text-sm">
                          Rs. {(inv.total || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && filteredInvoices.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <p className="font-black text-slate-300 uppercase tracking-[0.2em] italic">No Transactions Found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Invoices;
