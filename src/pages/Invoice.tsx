import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Eye, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/invoices');
      setInvoices(res.data);
    } catch (err) { toast.error("Sync error"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Delete record?")) {
      try {
        await axios.delete(`/api/invoices/${id}`, { headers: { 'user-role': user.role } });
        fetchData();
        toast.success("Record Deleted");
      } catch (err) { toast.error("Failed"); }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black italic uppercase">Invoice Logs</h1>
          <button onClick={fetchData} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600"><RefreshCw size={20} /></button>
        </header>
        <div className="bg-white rounded-[3rem] shadow-sm flex-1 overflow-auto p-6 border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                <th className="px-6 py-2">ID</th><th className="px-6 py-2">Cashier</th><th className="px-6 py-2">Total</th><th className="px-6 py-2 text-right">Options</th>
              </tr>
            </thead>
            <tbody>
              {!loading && invoices.map((inv) => (
                <tr key={inv._id} className="bg-slate-50 hover:bg-white transition-all group">
                  <td className="px-6 py-5 rounded-l-3xl font-black text-indigo-600 italic">#{inv.invoiceId}</td>
                  <td className="px-6 py-5 text-xs font-black uppercase">{inv.cashier}</td>
                  <td className="px-6 py-5 font-black text-slate-800">Rs. {inv.total?.toLocaleString()}</td>
                  <td className="px-6 py-5 rounded-r-3xl text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Eye size={16}/></button>
                      {isAdmin && <button onClick={() => handleDelete(inv._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>}
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

export default Invoices;
