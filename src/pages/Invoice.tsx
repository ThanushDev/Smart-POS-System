import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, Calendar, User, Eye, Printer, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, busRes] = await Promise.all([axios.get('/api/invoices'), axios.get('/api/business')]);
        setInvoices(invRes.data);
        setBusinessInfo(busRes.data);
      } catch (err) { toast.error("Error loading data"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleReprint = (inv: any) => {
    // Reprint දත්ත සකස් කිරීම
    const reprintData = {
      invoiceId: inv.invoiceId,
      cart: inv.items.map((item: any) => ({
        ...item,
        unitDiscount: item.unitDiscount || 0
      })),
      total: inv.total,
      discountTotal: inv.discountTotal || 0,
      paymentMethod: inv.paymentMethod,
      businessInfo,
      currentUser: { name: inv.cashier },
      date: new Date(inv.createdAt).toLocaleDateString(),
      time: new Date(inv.createdAt).toLocaleTimeString()
    };
    
    // Global Print state එකකට හෝ කෙලින්ම Print කිරීමට සලස්වන්න
    // මෙහිදී පහසුම ක්‍රමය Reprint සඳහා තාවකාලික View එකක් පෙන්වා print කිරීමයි
    setViewInvoice(reprintData);
    setTimeout(() => { window.print(); }, 500);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.cashier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <h1 className="text-3xl font-black text-slate-800 italic uppercase mb-8">Sales Records</h1>

        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex gap-4 border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" />
            <input type="text" placeholder="Search Invoices..." className="w-full bg-slate-50 pl-12 pr-4 py-3 rounded-xl outline-none font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-y-auto p-4 border border-slate-100">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] font-black">
                <th className="px-6 py-2">Invoice ID</th>
                <th className="px-6 py-2">Date</th>
                <th className="px-6 py-2">Cashier</th>
                <th className="px-6 py-2">Total</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="bg-slate-50 hover:bg-indigo-50/50 transition-all">
                  <td className="px-6 py-4 rounded-l-[1.5rem] font-black text-indigo-600">#{inv.invoiceId}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs font-black uppercase text-slate-700">{inv.cashier}</td>
                  <td className="px-6 py-4 font-black">Rs. {inv.total?.toFixed(2)}</td>
                  <td className="px-6 py-4 rounded-r-[1.5rem] text-right space-x-2">
                    <button onClick={() => setViewInvoice(inv)} className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all"><Eye size={16}/></button>
                    <button onClick={() => handleReprint(inv)} className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-600 hover:text-white transition-all"><Printer size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* VIEW MODAL & PRINT AREA */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 no-print">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black uppercase text-slate-700">Invoice Details</h2>
              <button onClick={() => setViewInvoice(null)} className="text-slate-400"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
               {/* මෙතැන බිල සාමාන්‍ය විදියට පෙන්වයි */}
               <div className="text-center mb-6">
                 <h3 className="font-black text-xl uppercase">{businessInfo?.name}</h3>
                 <p className="text-xs font-bold text-slate-400">#{viewInvoice.invoiceId || viewInvoice.invoiceId}</p>
               </div>
               <div className="space-y-4">
                 {(viewInvoice.items || viewInvoice.cart).map((item: any, idx: number) => (
                   <div key={idx} className="flex justify-between border-b border-slate-100 pb-2">
                     <div className="text-xs uppercase font-black w-2/3">{item.name} x {item.quantity}</div>
                     <div className="text-xs font-black">Rs. {((item.price - (item.unitDiscount || 0)) * item.quantity).toFixed(2)}</div>
                   </div>
                 ))}
               </div>
               <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-200">
                 <div className="flex justify-between font-black text-lg"><span>TOTAL</span><span>Rs. {viewInvoice.total?.toFixed(2)}</span></div>
               </div>
            </div>
            <div className="p-6 bg-slate-50">
              <button onClick={() => handleReprint(viewInvoice)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                <Printer size={18}/> Print Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Reprint Area for Window Print */}
      <div className="print-area hidden">
        {viewInvoice && (
          <PrintableBill 
            invoiceId={viewInvoice.invoiceId}
            cart={viewInvoice.items || viewInvoice.cart}
            total={viewInvoice.total}
            discountTotal={viewInvoice.discountTotal || 0}
            businessInfo={businessInfo}
            currentUser={{ name: viewInvoice.cashier }}
            date={new Date(viewInvoice.createdAt).toLocaleDateString()}
            time={new Date(viewInvoice.createdAt).toLocaleTimeString()}
          />
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 80mm; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoices;
