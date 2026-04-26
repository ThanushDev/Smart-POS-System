import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill'; 
import { Printer, Trash2, RefreshCw, FileText, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';
  const businessId = user.role === 'Admin' ? user._id : user.businessId;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/invoices', {
        headers: { 'business-id': businessId }
      });
      setInvoices(res.data);
    } catch (err) { 
      toast.error("Sync error"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (businessId) fetchData();
  }, [businessId]);

  const handlePrint = (inv: any) => {
    setSelectedInvoice(inv);
    toast.info(`Preparing Invoice #${inv.invoiceId}`);
    setTimeout(() => {
      window.print();
      setSelectedInvoice(null);
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this record permanently?")) {
      try {
        await axios.delete(`/api/invoices/${id}`, { 
          headers: { 'user-role': user.role } 
        });
        fetchData();
        toast.success("Record Deleted");
      } catch (err) { 
        toast.error("Delete failed"); 
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Sales <span className="text-indigo-600">History</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage and reprint your invoices</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Invoice ID..." 
                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm outline-none font-bold text-sm focus:ring-2 ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cashier</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-5 font-black text-indigo-600 italic">#{inv.invoiceId}</td>
                  <td className="px-6 py-5 text-xs font-black uppercase text-slate-600">{inv.cashier}</td>
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-black text-slate-800 uppercase">{inv.date}</p>
                    <p className="text-[9px] font-bold text-slate-400">{inv.time}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-800">Rs. {inv.total?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handlePrint(inv)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Printer size={16}/>
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(inv._id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && !loading && (
            <div className="p-20 text-center text-slate-300">
               <FileText size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-black uppercase tracking-widest text-xs">No Invoices Found</p>
            </div>
          )}
        </div>
      </main>

      {/* Printing Backdrop Logic */}
      <div className="print-area hidden">
        {selectedInvoice && <PrintableBill {...selectedInvoice} />}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Invoices;
