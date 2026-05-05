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
    // MongoDB ID එක URL එක හරහා අලුත් Tab එකකට යවනවා
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Billing <span className="text-indigo-600">History</span>
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Invoice ID..." 
              className="pl-10 pr-4 py-3 bg-white rounded-2xl shadow-sm outline-none w-64 focus:ring-2 ring-indigo-500" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
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
                invoices
                  .filter(inv => inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((inv) => {
                    // Date එක format කරගැනීම
                    const invoiceDate = new Date(inv.createdAt || inv.date);
                    const formattedDate = invoiceDate.toLocaleDateString();
                    const formattedTime = invoiceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={inv._id} className="hover:bg-slate-50 transition-all group">
                        <td className="px-8 py-6">
                          <span className="font-black text-indigo-600 italic">#{inv.invoiceId}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <Calendar size={12} /> {formattedDate}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                              <Clock size={12} /> {formattedTime}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs font-black uppercase text-slate-600">{inv.cashier}</td>
                        <td className="px-8 py-6 font-black text-slate-800">Rs. {inv.total?.toLocaleString()}</td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button 
                            onClick={() => handlePrint(inv._id)} 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Printer size={18}/>
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(inv._id)} 
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
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
      </main>
    </div>
  );
};

export default Invoice;
