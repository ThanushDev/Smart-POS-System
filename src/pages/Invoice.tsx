import React, { useState, useEffect, useRef } from 'react';
    import Sidebar from '../components/Sidebar';
    import { Eye, Printer, Search, X } from 'lucide-react';
    import PrintableBill from '../components/PrintableBill';
    import { motion, AnimatePresence } from 'framer-motion';

    const Invoice = () => {
      const [invoices, setInvoices] = useState<any[]>([]);
      const [search, setSearch] = useState('');
      const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
      const [businessInfo, setBusinessInfo] = useState<any>({ name: 'Smart POS', logo: '' });
      const printRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const savedInvoices = localStorage.getItem('invoices');
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
        
        const savedInfo = localStorage.getItem('businessInfo');
        if (savedInfo) setBusinessInfo(JSON.parse(savedInfo));
      }, []);

      const filteredInvoices = invoices.filter(inv => 
        inv.id.toLowerCase().includes(search.toLowerCase())
      );

      const handleReprint = (inv: any) => {
        setSelectedInvoice(inv);
        setTimeout(() => {
          window.print();
        }, 100);
      };

      return (
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Invoice History</h1>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search invoice number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice #</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold">Total Amount</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.id}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">Rs. {inv.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleReprint(inv)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                            title="Reprint"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="font-bold text-slate-900">Invoice Details</h2>
                      <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                      <div className="text-center mb-6">
                        {businessInfo.logo && <img src={businessInfo.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />}
                        <h3 className="text-xl font-bold uppercase">{businessInfo.name}</h3>
                        <p className="text-sm text-slate-500">Invoice #{selectedInvoice.id}</p>
                      </div>
                      <div className="space-y-3 mb-6">
                        {selectedInvoice.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Rs. {selectedInvoice.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button 
                        onClick={() => handleReprint(selectedInvoice)}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"
                      >
                        <Printer size={18} />
                        Print Invoice
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </main>

          {selectedInvoice && (
            <PrintableBill 
              ref={printRef}
              invoiceNumber={selectedInvoice.id}
              items={selectedInvoice.items}
              total={selectedInvoice.total}
              businessName={businessInfo.name}
              businessLogo={businessInfo.logo}
              date={selectedInvoice.date}
              time={selectedInvoice.time}
            />
          )}
        </div>
      );
    };

    export default Invoice;
