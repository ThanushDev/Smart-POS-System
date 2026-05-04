import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, Receipt } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const [cartIndex, setCartIndex] = useState(-1); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const subTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const discountTotal = cart.reduce((sum, item) => sum + (Number(item.unitDiscount || 0) * Number(item.quantity || 0)), 0);
  const finalTotal = subTotal - discountTotal;

  useEffect(() => {
    fetchProducts();
    searchInputRef.current?.focus();
  }, []);

  const fetchProducts = () => {
    axios.get('/api/products?businessId=' + user.businessId)
      .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProducts([]));
  };

  const handlePrintInNewWindow = () => {
    const printContent = document.getElementById('printable-bill-area');
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=900');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Bill - DIGI SOLUTIONS</title>');
      printWindow.document.write(`
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; background-color: #fff; }
          @media print {
            body { width: 80mm; }
          }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        
        setCart([]);
        setInvoiceData(null);
        setCartIndex(-1);
        setSearchTerm('');
        setIsProcessing(false);
        setTimeout(() => searchInputRef.current?.focus(), 200);
      }, 600);
    }
  };

  const processFinalOrder = async (currentCart: any[], currentMethod: string, total: number) => {
    if (currentCart.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const loadingToast = toast.loading("Finalizing Bill...");

    const newInvoice = {
      invoiceId: `INV-${Date.now()}`,
      cart: currentCart,
      total: total || 0,
      paymentMethod: currentMethod, // Payment method එක මෙතනට එකතු කළා
      currentUser: user,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      businessId: user.businessId
    };

    try {
      await axios.post('/api/invoices', newInvoice);
      setInvoiceData(newInvoice);
      setShowPaymentModal(false);
      toast.update(loadingToast, { render: "Bill Completed!", type: "success", isLoading: false, autoClose: 2000 });
      fetchProducts();
    } catch (err) {
      setIsProcessing(false);
      toast.update(loadingToast, { render: "Error! Check Network", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (invoiceData) {
      const timer = setTimeout(() => handlePrintInNewWindow(), 500);
      return () => clearTimeout(timer);
    }
  }, [invoiceData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPaymentModal) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPaymentMethod('CASH'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPaymentMethod('CARD'); }
        if (e.key === 'Enter') { e.preventDefault(); processFinalOrder(cart, paymentMethod, finalTotal); }
        if (e.key === 'Escape') { e.preventDefault(); setShowPaymentModal(false); }
        return; 
      }

      if (document.activeElement === searchInputRef.current) {
        const filteredList = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev < filteredList.length - 1 ? prev + 1 : prev)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev)); }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredList[selectedIndex]) {
            const p = filteredList[selectedIndex];
            setCart(curr => {
              const ex = curr.find(i => i._id === p._id);
              if (ex) return curr.map(i => i._id === p._id ? {...i, quantity: i.quantity + 1} : i);
              return [...curr, {...p, quantity: 1, unitDiscount: ((p.price || 0) * (p.discount || 0) / 100)}];
            });
            setSearchTerm('');
          }
        }
        if (e.key === 'Tab' && cart.length > 0) { e.preventDefault(); setCartIndex(0); searchInputRef.current?.blur(); }
      }
      else if (cartIndex !== -1) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setCartIndex(p => (p < cart.length - 1 ? p + 1 : p)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setCartIndex(p => (p > 0 ? p - 1 : p)); }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCart(prev => prev.map((item, i) => i === cartIndex ? {...item, quantity: item.quantity + 1} : item));
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCart(prev => prev.map((item, i) => i === cartIndex && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item));
        }
        if (e.key === 'Delete') {
          e.preventDefault();
          setCart(prev => prev.filter((_, i) => i !== cartIndex));
          setCartIndex(-1);
          searchInputRef.current?.focus();
        }
        if (e.key === 'Escape') { e.preventDefault(); setCartIndex(-1); searchInputRef.current?.focus(); }
      }

      if (e.key === 'F2') { e.preventDefault(); setCartIndex(-1); searchInputRef.current?.focus(); }
      if (e.key === 'F8' && cart.length > 0) { e.preventDefault(); setShowPaymentModal(true); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal, paymentMethod, cart, cartIndex, products, searchTerm, selectedIndex, isProcessing, finalTotal]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden italic">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        <div className="flex-[1.5] flex flex-col">
          <div className={`bg-white p-6 rounded-[2.5rem] shadow-md flex items-center gap-4 mb-4 border-4 transition-all ${cartIndex === -1 ? 'border-indigo-500' : 'border-transparent opacity-40'}`}>
            <Search className="text-indigo-600" size={24} />
            <input ref={searchInputRef} type="text" placeholder="F2: SEARCH PRODUCT" className="flex-1 outline-none font-black text-xl uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-2 overflow-y-auto">
            {searchTerm && filtered.map((p, i) => {
              const hasDiscount = p.discount > 0;
              const discountedPrice = p.price - ((p.price * (p.discount || 0)) / 100);
              
              return (
                <div key={p._id} className={`p-5 rounded-3xl flex justify-between items-center transition-all ${selectedIndex === i && cartIndex === -1 ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-600'}`}>
                  <div>
                    <h4 className="font-black text-sm uppercase">{p.name}</h4>
                    <p className="text-[10px] font-bold opacity-60">Stock: {p.qty}</p>
                    {hasDiscount && (
                      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter">
                        {p.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {hasDiscount && <p className="text-[10px] line-through opacity-50">Rs.{p.price}</p>}
                    <p className="font-black text-lg">Rs.{(hasDiscount ? discountedPrice : p.price).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
          <div className={`p-6 ${cartIndex !== -1 ? 'bg-amber-500' : 'bg-slate-800'} text-white`}>
            <h2 className="text-xl font-black uppercase tracking-tight">Cart Summary</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((item, i) => (
              <div key={item._id} className={`flex items-center justify-between p-5 rounded-[2rem] border-4 transition-all ${cartIndex === i ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-transparent'}`}>
                <div className="flex-1">
                  <h5 className="font-black text-xs uppercase">{item.name}</h5>
                  <p className="text-indigo-600 font-black text-xs mt-1">Rs.{(Number(item?.price) || 0).toLocaleString()} x {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-slate-50 border-t-2">
            <div className="flex justify-between font-black text-3xl uppercase text-indigo-600 mb-4">
              <span>Total</span>
              <span>Rs.{(Number(finalTotal) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <button onClick={() => setShowPaymentModal(true)} disabled={isProcessing || cart.length === 0} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase shadow-xl disabled:bg-slate-400">
                {isProcessing ? "PROCESSING..." : "FINISH BILL (F8)"}
            </button>
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl border-8 border-indigo-600 w-[500px]">
             <h2 className="text-3xl font-black uppercase mb-10 italic">Pay via <span className="text-indigo-600">{paymentMethod}</span></h2>
             <div className="grid grid-cols-2 gap-6 mb-10">
                <div onClick={() => setPaymentMethod('CASH')} className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                    <Receipt size={48} className="mx-auto mb-2" />
                    <p className="font-black text-xl">CASH</p>
                </div>
                <div onClick={() => setPaymentMethod('CARD')} className={`p-10 rounded-[3rem] border-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                    <Receipt size={48} className="mx-auto mb-2" />
                    <p className="font-black text-xl">CARD</p>
                </div>
             </div>
             <div className="bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase text-lg animate-pulse shadow-xl">
                {isProcessing ? "SAVING..." : "PRESS ENTER TO PRINT"}
             </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <div id="printable-bill-area">
          {invoiceData && <PrintableBill {...invoiceData} businessInfo={user} />}
        </div>
      </div>
    </div>
  );
};

export default NewBill;
