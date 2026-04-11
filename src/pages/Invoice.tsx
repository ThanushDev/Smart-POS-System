import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, Calendar, Eye, Printer, X, Trash2, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inv, bus] = await Promise.all([axios.get('/api/invoices'), axios.get('/api/business')]);
      setInvoices(inv.data);
      setBusinessInfo(bus.data);
    } catch (err) { toast.error("Sync error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!isAdmin) return toast.error("Admin Only!");
    if (window.confirm(`Delete Invoice #${code}?`)) {
      setDeleteLoading(true);
      try {
        await axios.delete(`/api/invoices/${id}`, { headers: { 'user-role': user.role } });
        setViewInvoice(null);
        fetchData();
        toast.success("Invoice Deleted");
      } catch (err) { toast.error("Delete failed"); } finally { setDeleteLoading(false); }
    }
  };

  const filtered = invoices.filter(inv => inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black italic uppercase">Sales Records</h1>
          <button onClick={fetchData} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><RefreshCw size={20} /></button>
        </header>
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6"><input type="text" placeholder="Search ID..." className="w-full bg-slate-50 p-4 rounded-xl outline-none font-bold" onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="bg-white rounded-[3rem] shadow-sm flex-1 overflow-auto p-6">
          <table className="w-full text-left">
            <thead><tr className="text-slate-400 uppercase text-[10px] font-black"><th className="px-6 py-2">ID</th><th className="px-6 py-2">Date</th><th className="px-6 py-2">Cashier</th><th className="px-6 py-2">Total</th><th className="px-6 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {!loading && filtered.map((inv) => (
                <tr key={inv._id} className="bg-slate-50 hover:bg-white transition-all group">
                  <td className="px-6 py-5 rounded-l-3xl font-black text-indigo-600 italic">#{inv.invoiceId}</td>
                  <td className="px-6 py-5 text-xs font-bold">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-xs font-black uppercase">{inv.cashier}</td>
                  <td className="px-6 py-5 font-black">Rs. {inv.total?.toLocaleString()}</td>
                  <td className="px-6 py-5 rounded-r-3xl text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewInvoice(inv)} className="p-2 text-indigo-600"><Eye size={16}/></button>
                      {isAdmin && <button onClick={() => handleDelete(inv._id, inv.invoiceId)} className="p-2 text-rose-500"><Trash2 size={16}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4 no-print">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-8 relative">
            <button onClick={() => setViewInvoice(null)} className="absolute top-6 right-6 text-slate-400"><X size={24}/></button>
            <h2 className="text-xl font-black uppercase text-center mb-6">Invoice #{viewInvoice.invoiceId}</h2>
            <div className="bg-indigo-50 p-4 rounded-2xl flex justify-between items-center mb-6">
              <span className="font-black text-sm uppercase">Total</span>
              <span className="font-black text-xl text-indigo-600">Rs. {viewInvoice.total?.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button onClick={() => handleDelete(viewInvoice._id, viewInvoice.invoiceId)} disabled={deleteLoading} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                  {deleteLoading ? <Loader2 className="animate-spin" size={14}/> : <Trash2 size={14}/>} Wipe Data
                </button>
              )}
              <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Printer size={14}/> Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
