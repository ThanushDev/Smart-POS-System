import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Eye, Printer, Search, X, Trash2, FileText } from 'lucide-react';
import PrintableBill from '../components/PrintableBill';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoice = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invRes, bizRes] = await Promise.all([axios.get('/api/invoices'), axios.get('/api/business')]);
      setInvoices(invRes.data); setBusinessInfo(bizRes.data);
    } catch (err) { toast.error("Failed to load records"); }
    finally { setIsLoading(false); }
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

  const handleReprint = (inv: any) => {
    setSelectedInvoice(inv);
    setTimeout(() => { window.print(); }, 500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3"><FileText /> Invoice History</h1>
        </header>
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50">
            <input type="text" placeholder="Search ID..." className="w-full max-w-md p-3 rounded-2xl bg-white font-bold" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr><th className="px-8 py-4">Invoice ID</th><th className="px-8 py-4">Total</th><th className="px-8 py-4 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.filter(inv => inv.invoiceId.toLowerCase().includes(search.toLowerCase())).map((inv) => (
                <tr key={inv._id} className="hover:bg-indigo-50/30">
                  <td className="px-8 py-5 font-black text-indigo-600">{inv.invoiceId}</td>
                  <td className="px-8 py-5 font-black">Rs. {inv.total.toLocaleString()}</td>
                  <td className="px-8 py-5 flex justify-center gap-3">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-2 bg-slate-100 rounded-xl"><Eye size={16} /></button>
                    <button onClick={() => handleReprint(inv)} className="p-2 bg-slate-100 rounded-xl"><Printer size={16} /></button>
                    <button onClick={() => handleDeleteInvoice(inv._id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <div className="hidden">
        {selectedInvoice && (
          <PrintableBill ref={printRef} invoiceId={selectedInvoice.invoiceId} cart={selectedInvoice.items} total={selectedInvoice.total} paymentMethod={selectedInvoice.paymentMethod || 'Cash'} businessInfo={businessInfo} currentUser={{ name: selectedInvoice.cashier }} date={new Date(selectedInvoice.createdAt).toLocaleDateString()} time={new Date(selectedInvoice.createdAt).toLocaleTimeString()} />
        )}
      </div>
    </div>
  );
};
export default Invoice;
