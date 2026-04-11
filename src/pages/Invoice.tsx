import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Calendar, FileText, User, CreditCard, Banknote, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices');
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Records load කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.cashier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">Sales Records</h1>
          <p className="text-slate-400 text-sm font-bold">Track all your invoices and transactions</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex gap-4 items-center border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Invoice ID or Cashier..." 
              className="w-full bg-slate-50 pl-12 pr-4 py-3 rounded-xl outline-none font-bold text-slate-600 border border-transparent focus:border-indigo-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 px-6 border-l border-slate-100">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Sales</p>
                <p className="text-lg font-black text-indigo-600">{filteredInvoices.length}</p>
             </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-hidden flex flex-col border border-slate-100">
          <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full font-bold text-slate-400 uppercase">Loading Records...</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-6 py-2">Invoice ID</th>
                    <th className="px-6 py-2">Date & Time</th>
                    <th className="px-6 py-2">Cashier</th>
                    <th className="px-6 py-2">Method</th>
                    <th className="px-6 py-2">Discount</th>
                    <th className="px-6 py-2">Final Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="bg-slate-50 hover:bg-indigo-50/50 transition-colors group">
                      <td className="px-6 py-4 rounded-l-[1.5rem] font-black text-indigo-600 text-sm">
                        #{inv.invoiceId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Calendar size={14} />
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase">
                          <User size={14} className="text-slate-400" />
                          {inv.cashier}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${inv.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {inv.paymentMethod === 'Cash' ? <Banknote size={12}/> : <CreditCard size={12}/>}
                          {inv.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-500 text-xs">
                        - Rs. {inv.discountTotal?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 rounded-r-[1.5rem] font-black text-slate-800 text-sm">
                        Rs. {inv.total?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 font-bold text-slate-400 uppercase">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Invoices;
