import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Printer, Trash2, Search, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoice = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchData = async () => {
    if (!user.businessId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/invoices?businessId=${user.businessId}`);
      setInvoices(res.data);
    } catch (err) { 
      toast.error("Error loading invoices"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [user.businessId]);

  const handlePrint = (mongoId: string) => {
    window.open(`/print?id=${mongoId}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(`/api/invoices/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) { toast.error("Delete failed"); }
  };

  const filtered = invoices.filter(inv => inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0 p-4 md:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Billing <span className="text-indigo-600">History</span>
          </h1>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Search Invoice ID..." 
              className="pl-10 pr-4 py-3 bg-white rounded-2xl shadow-sm outline-none w-full sm:w-64 focus:ring-2 ring-indigo-500 font-bold text-sm" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">Invoice Details</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Cashier</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 font-bold">Loading Data...</td></tr>
              ) : (
                filtered.map((inv) => {
                  const invoiceDate = new Date(inv.createdAt || inv.date);
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-8 py-6">
                        <span className="font-black text-indigo-600 italic">#{inv.invoiceId}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Calendar size={12} /> {invoiceDate.toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                            <Clock size={12} /> {invoiceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-black uppercase text-slate-600">{inv.cashier}</td>
                      <td className="px-8 py-6 font-black text-slate-800">Rs. {inv.total?.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button onClick={() => handlePrint(inv._id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Printer size={18}/>
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(inv._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={18}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading && <div className="text-center py-10 font-bold text-slate-400">Loading Data...</div>}
          {!loading && filtered.map((inv) => {
            const invoiceDate = new Date(inv.createdAt || inv.date);
            return (
              <div key={inv._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-black text-indigo-600 italic text-sm">#{inv.invoiceId}</span>
                  <span className="font-black text-slate-800 text-sm">Rs. {inv.total?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold mb-3">
                  <span className="flex items-center gap-1"><Calendar size={11}/>{invoiceDate.toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/>{invoiceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {inv.cashier && <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Cashier: {inv.cashier}</p>}
                <div className="flex gap-2 justify-end border-t border-slate-50 pt-3">
                  <button onClick={() => handlePrint(inv._id)} className="flex items-center gap-1 px-3 py-2 text-indigo-600 bg-indigo-50 rounded-xl font-black text-xs">
                    <Printer size={14}/> Print
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(inv._id)} className="flex items-center gap-1 px-3 py-2 text-rose-500 bg-rose-50 rounded-xl font-black text-xs">
                      <Trash2 size={14}/> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-bold">No invoices found</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Invoice;
