import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, Calendar, User, Eye, Printer, X, Clock, Trash2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, busRes] = await Promise.all([
        axios.get('/api/invoices'), 
        axios.get('/api/business')
      ]);
      setInvoices(invRes.data);
      setBusinessInfo(busRes.data);
    } catch (err) { 
      toast.error("Failed to sync with MongoDB server."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleReprint = (inv: any) => {
    const invoiceDate = new Date(inv.createdAt);
    const reprintData = {
      invoiceId: inv.invoiceId,
      cart: inv.items || [],
      total: inv.total,
      discountTotal: inv.discountTotal || 0,
      paymentMethod: inv.paymentMethod,
      businessInfo,
      currentUser: { name: inv.cashier },
      date: invoiceDate.toLocaleDateString(),
      time: invoiceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setViewInvoice(reprintData);
    // Print window එක open වීමට සුළු වෙලාවක් ලබා දීම
    setTimeout(() => { 
      window.print(); 
    }, 500);
  };

  const handleDeleteInvoice = async (mongoId: string, displayId: string) => {
    if (!mongoId) {
      toast.error("Invalid ID: Database record not found.");
      return;
    }

    if (window.confirm(`Are you sure? Invoice #${displayId} will be permanently removed from MongoDB.`)) {
      setDeleteLoading(true);
      try {
        const response = await axios.delete(`/api/invoices/${mongoId}`);
        
        if (response.data.success) {
          toast.success(`Invoice #${displayId} deleted successfully.`);
          setViewInvoice(null);
          fetchData(); // Table එක refresh කිරීම
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "Internal Server Error";
        toast.error(`Delete Failed: ${msg}`);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.cashier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter leading-none">Sales Records</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">MongoDB Live Data Management</p>
          </div>
          <button onClick={fetchData} className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 hover:rotate-180 transition-all duration-500">
            <RefreshCw size={20} />
          </button>
        </header>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 border border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-4 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by ID or Cashier..." 
              className="w-full bg-slate-50 pl-14 pr-6 py-4 rounded-2xl outline-none font-bold text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/10 transition-all" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[3rem] shadow-sm flex-1 overflow-hidden flex flex-col border border-slate-100 p-6">
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-6 py-2">Invoice ID</th>
                  <th className="px-6 py-2">Timestamp</th>
                  <th className="px-6 py-2">Cashier</th>
                  <th className="px-6 py-2">Amount</th>
                  <th className="px-6 py-2 text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <span className="font-black text-slate-300 uppercase italic text-xs tracking-widest">Syncing Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 font-bold text-slate-300 italic uppercase tracking-widest">No Records Found</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const dateObj = new Date(inv.createdAt);
                    return (
                      <tr key={inv._id} className="bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                        <td className="px-6 py-5 rounded-l-[1.8rem] font-black text-indigo-600 text-sm italic">#{inv.invoiceId}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-xs uppercase flex items-center gap-2">
                              <Calendar size={12} className="text-slate-300" /> {dateObj.toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 italic mt-1 uppercase flex items-center gap-2">
                              <Clock size={12} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-xs font-black uppercase text-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px]">
                              {inv.cashier?.charAt(0)}
                            </div>
                            {inv.cashier}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-black text-slate-800 tracking-tight">Rs. {inv.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 rounded-r-[1.8rem] text-right">
                          <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewInvoice(inv)} className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all">
                              <Eye size={16}/>
                            </button>
                            <button onClick={() => handleReprint(inv)} className="p-2.5 bg-white text-emerald-600 rounded-xl shadow-sm border border-slate-100 hover:bg-emerald-600 hover:text-white transition-all">
                              <Printer size={16}/>
                            </button>
                            <button 
                              disabled={deleteLoading}
                              onClick={() => handleDeleteInvoice(inv._id, inv.invoiceId)} 
                              className="p-2.5 bg-white text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {viewInvoice && !window.matchMedia('print').matches && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4 no-print">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative">
            
            <button onClick={() => setViewInvoice(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all z-10">
              <X size={24}/>
            </button>

            <div className="p-10 pb-6 text-center border-b border-dashed border-slate-100 bg-slate-50/50">
              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3">
                <AlertCircle size={32} />
              </div>
              <h2 className="font-black text-2xl uppercase text-slate-800 italic tracking-tighter">Bill Breakdown</h2>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2">Invoice #{viewInvoice.invoiceId}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-10 py-6 space-y-4">
               <div className="space-y-3">
                 {(viewInvoice.items || []).map((item: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-start gap-4">
                     <div className="flex-1">
                        <p className="text-xs font-black uppercase text-slate-700 leading-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Qty: {item.quantity} × Rs.{item.price.toFixed(2)}</p>
                     </div>
                     <p className="text-xs font-black text-slate-800 whitespace-nowrap">
                       Rs. {((item.price - (item.unitDiscount || 0)) * item.quantity).toFixed(2)}
                     </p>
                   </div>
                 ))}
               </div>

               <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub Total</span>
                    <span className="text-xs font-bold text-slate-600">Rs. {(viewInvoice.total + (viewInvoice.discountTotal || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Savings</span>
                    <span className="text-xs font-bold text-emerald-500">- Rs. {(viewInvoice.discountTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <span className="font-black text-sm text-indigo-900 uppercase italic">Grand Total</span>
                    <span className="font-black text-xl text-indigo-600 italic">Rs. {viewInvoice.total?.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="p-10 pt-4 flex gap-3">
              <button 
                disabled={deleteLoading}
                onClick={() => handleDeleteInvoice(viewInvoice._id, viewInvoice.invoiceId)} 
                className="flex-1 py-5 bg-rose-50 text-rose-500 border border-rose-100 rounded-[1.8rem] font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>} Wipe Data
              </button>
              <button onClick={() => handleReprint(viewInvoice)} className="flex-[1.5] py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                <Printer size={16}/> Print Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Area - Hidden by default */}
      <div className="print-area hidden">
        {viewInvoice && (
          <PrintableBill 
            invoiceId={viewInvoice.invoiceId}
            cart={viewInvoice.items || []}
            total={viewInvoice.total}
            discountTotal={viewInvoice.discountTotal || 0}
            businessInfo={businessInfo}
            currentUser={{ name: viewInvoice.cashier }}
            date={viewInvoice.date || new Date(viewInvoice.createdAt).toLocaleDateString()}
            time={viewInvoice.time || new Date(viewInvoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 80mm; background: white; }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Invoices;
