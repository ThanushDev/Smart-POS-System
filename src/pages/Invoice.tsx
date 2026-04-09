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

  // 1. MongoDB එකෙන් Invoices සහ Business Info ලබා ගැනීම
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // එකවර API දෙකම Call කිරීම
      const [invRes, bizRes] = await Promise.all([
        axios.get('/api/invoices'),
        axios.get('/api/business')
      ]);
      
      setInvoices(invRes.data);
      setBusinessInfo(bizRes.data);
    } catch (err) {
      toast.error("Failed to load data from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Invoice එකක් මැකීම (MongoDB Delete)
  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("මෙම බිල්පත ස්ථිරවම මකා දැමීමට ඔබට අවශ්‍යද?")) {
      try {
        // Query param එකක් ලෙස ID එක යැවීම
        await axios.delete(`/api/invoices?id=${id}`);
        setInvoices(invoices.filter(inv => inv._id !== id));
        toast.success("Invoice deleted successfully");
      } catch (err) {
        toast.error("Error deleting invoice");
      }
    }
  };

  // 3. Search කිරීමේ පහසුකම
  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceId || inv.id || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleReprint = (inv: any) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <FileText className="text-indigo-600" /> Invoice History
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage and reprint your sales records</p>
        </header>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by Invoice ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-white shadow-inner outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Invoice ID</th>
                  <th className="px-8 py-4">Date & Time</th>
                  <th className="px-8 py-4">Cashier</th>
                  <th className="px-8 py-4">Total Amount</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-400 italic">Loading Database Records...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-400 italic">No matching invoices found.</td></tr>
                ) : filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 font-black text-indigo-600 text-sm">{inv.invoiceId}</td>
                    <td className="px-8 py-5 text-slate-600 font-bold text-xs uppercase">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-bold text-xs uppercase">{inv.cashier || 'System'}</td>
                    <td className="px-8 py-5 font-black text-slate-800">
                      Rs. {inv.total.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleReprint(inv)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                          <Printer size={16} />
                        </button>
                        <button onClick={() => handleDeleteInvoice(inv._id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Preview Modal */}
        <AnimatePresence>
          {selectedInvoice && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border-t-8 border-indigo-600"
              >
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">Invoice Preview</span>
                  <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-black italic uppercase text-slate-800 tracking-tighter">
                      {businessInfo?.name || 'Digi Solutions'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{selectedInvoice.invoiceId}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {selectedInvoice.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <p className="font-black text-slate-700 uppercase text-xs">{item.name}</p>
                          <p className="text-[10px] font-bold text-indigo-500">{item.quantity} Unit(s) x Rs.{item.price}</p>
                        </div>
                        <span className="font-black text-slate-800 text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-[2rem] flex justify-between items-center">
                    <span className="font-black text-indigo-600 uppercase text-sm italic">Grand Total</span>
                    <span className="font-black text-indigo-600 text-2xl italic">Rs. {selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => handleReprint(selectedInvoice)}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-indigo-200 uppercase text-xs"
                  >
                    <Printer size={18} /> Reprint Receipt
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Printable Component */}
      <div className="hidden">
        {selectedInvoice && (
          <PrintableBill 
            ref={printRef}
            invoiceId={selectedInvoice.invoiceId}
            cart={selectedInvoice.items}
            total={selectedInvoice.total}
            paymentMethod={selectedInvoice.paymentMethod || 'Cash'}
            businessInfo={businessInfo}
            currentUser={{ name: selectedInvoice.cashier }}
            date={new Date(selectedInvoice.createdAt).toLocaleDateString()}
            time={new Date(selectedInvoice.createdAt).toLocaleTimeString()}
          />
        )}
      </div>
    </div>
  );
};

export default Invoice;
