import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Eye, Printer, Search, X, Trash2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoice = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const invRes = await axios.get('/api/invoices');
      setInvoices(invRes.data);
      try {
        const bizRes = await axios.get('/api/business');
        setBusinessInfo(bizRes.data);
      } catch (e) { setBusinessInfo({ name: "Digi Solutions" }); }
    } catch (err) {
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("Delete this bill permanently?")) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        setInvoices(invoices.filter(inv => inv._id !== id));
        toast.success("Invoice deleted!");
      } catch (err) { toast.error("Error deleting invoice"); }
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8"><h1 className="text-3xl font-black italic uppercase tracking-tighter">Invoice History</h1></header>
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50">
            <input type="text" placeholder="Search Invoice ID..." className="w-full max-w-md p-3 rounded-2xl bg-white shadow-inner font-bold text-sm outline-none" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr><th className="px-8 py-4">Invoice ID</th><th className="px-8 py-4">Total</th><th className="px-8 py-4 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={3} className="px-8 py-20 text-center font-bold text-slate-400">Loading...</td></tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-indigo-50/30">
                  <td className="px-8 py-5 font-black text-indigo-600">{inv.invoiceId}</td>
                  <td className="px-8 py-5 font-black">Rs. {inv.total.toLocaleString()}</td>
                  <td className="px-8 py-5 flex justify-center gap-3">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-2 bg-slate-100 rounded-xl"><Eye size={16} /></button>
                    <button onClick={() => handleDeleteInvoice(inv._id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] w-full max-w-lg p-8 relative">
              <button onClick={() => setSelectedInvoice(null)} className="absolute top-6 right-6"><X size={20} /></button>
              <h3 className="text-2xl font-black italic uppercase text-center mb-6">{businessInfo?.name}</h3>
              <div className="space-y-3 mb-6">
                {selectedInvoice.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold text-xs">{item.name} x {item.quantity}</span>
                    <span className="font-bold text-xs">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50 p-5 rounded-2xl flex justify-between">
                <span className="font-black text-indigo-600">Total</span>
                <span className="font-black text-indigo-600 text-xl">Rs. {selectedInvoice.total}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invoice;
