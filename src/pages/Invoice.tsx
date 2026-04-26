import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill'; 
import { Printer, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoice = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/invoices?businessId=${user.businessId}`);
      setInvoices(res.data);
    } catch (err) { toast.error("Sync error"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePrint = (inv: any) => {
    setSelectedInvoice(inv);
    setTimeout(() => { window.print(); setSelectedInvoice(null); }, 500);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(`/api/invoices/${id}`);
      fetchData(); toast.success("Deleted");
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black italic uppercase">Billing <span className="text-indigo-600">History</span></h1>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5 tracking-widest">Invoice ID</th>
                <th className="px-8 py-5 tracking-widest">Cashier</th>
                <th className="px-8 py-5 tracking-widest">Total</th>
                <th className="px-8 py-5 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6 font-black text-indigo-600 italic">#{inv.invoiceId}</td>
                  <td className="px-8 py-6 text-xs font-black uppercase text-slate-600">{inv.cashier}</td>
                  <td className="px-8 py-6 font-black text-slate-800">Rs. {inv.total.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => handlePrint(inv)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                    {isAdmin && <button onClick={() => handleDelete(inv._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <div className="hidden print:block">{selectedInvoice && <PrintableBill {...selectedInvoice} />}</div>
    </div>
  );
};
export default Invoice;
