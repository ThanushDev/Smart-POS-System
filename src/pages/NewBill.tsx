import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, ShoppingCart, Receipt } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const [cartIndex, setCartIndex] = useState(-1); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + (item.unitDiscount * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  useEffect(() => {
    axios.get('/api/products?businessId=' + user.businessId).then(res => setProducts(res.data));
    searchInputRef.current?.focus();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      setCart([]);
      setInvoiceData(null);
      setCartIndex(-1);
      setSearchTerm('');
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  });

  // Modal eken eliyedi use karanna puluwan widiyata finalize order eka haduwa
  const finalizeOrder = async () => {
    if (cart.length === 0) return;
    
    const newInvoice = {
      invoiceId: `INV-${Date.now()}`,
      cart: cart,
      total: finalTotal,
      discountTotal: discountTotal,
      paymentMethod: paymentMethod,
      currentUser: user,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      businessId: user.businessId
    };

    try {
      await axios.post('/api/invoices', newInvoice);
      setInvoiceData(newInvoice);
      setShowPaymentModal(false); // Modal eka issellama wahanawa print ekata kalin
      toast.info("Processing Print...");
    } catch (err) {
      toast.error("Database Error");
    }
  };

  // invoiceData update unama print trigger wenna effect ekak damma
  useEffect(() => {
    if (invoiceData) {
      setTimeout(() => handlePrint(), 500);
    }
  }, [invoiceData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // --- 1. MODAL CONTROLS ---
      if (showPaymentModal) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPaymentMethod('CASH'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPaymentMethod('CARD'); }
        if (e.key === 'Enter') {
          e.preventDefault();
          finalizeOrder(); // Meka trigger wenna ona
        }
        if (e.key === 'Escape') { e.preventDefault(); setShowPaymentModal(false); }
        return; 
      }

      // --- 2. SEARCH FOCUS ---
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0,8).length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0,8);
          if (filtered[selectedIndex]) {
            const p = filtered[selectedIndex];
            setCart(curr => {
              const ex = curr.find(i => i._id === p._id);
              if (ex) return curr.map(i => i._id === p._id ? {...i, quantity: i.quantity + 1} : i);
              return [...curr, {...p, quantity: 1, unitDiscount: (p.price * (p.discount || 0) / 100)}];
            });
            setSearchTerm('');
          }
        }
        if (e.key === 'Tab') {
          if (cart.length > 0) { e.preventDefault(); setCartIndex(0); searchInputRef.current?.blur(); }
        }
      }

      // --- 3. CART NAVIGATION ---
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

      // --- 4. GLOBAL KEYS ---
      if (e.key === 'F2') { e.preventDefault(); setCartIndex(-1); searchInputRef.current?.focus(); }
      if (e.key === 'F8' && cart.length > 0) { e.preventDefault(); setShowPaymentModal(true); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaymentModal, paymentMethod, cart, cartIndex, products, searchTerm, selectedIndex]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden italic">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        <div className="flex-[1.5] flex flex-col">
          <div className={`bg-white p-6 rounded-[2.5rem] shadow-md flex items-center gap-4 mb-4 border-4 transition-all ${cartIndex === -1 ? 'border-indigo-500' : 'border-transparent opacity-40'}`}>
            <Search className="text-indigo-600" size={24} />
            <input ref={searchInputRef} type="text" placeholder="F2: SEARCH" className="flex-1 outline-none font-black text-xl uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-2 overflow-y-auto">
            {searchTerm && filtered.map((p, i) => (
              <div key={p._id} className={`p-5 rounded-3xl flex justify-between items-center transition-all ${selectedIndex === i && cartIndex === -1 ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-600'}`}>
                <div><h4 className="font-black text-sm uppercase">{p.name}</h4><p className="text-[10px] font-bold opacity-60">{p.code}</p></div>
                <p className="font-black text-lg">Rs.{p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
          <div className={`p-6 ${cartIndex !== -1 ? 'bg-amber-500' : 'bg-slate-800'} text-white flex justify-between items-center`}>
            <h2 className="text-xl font-black uppercase tracking-tighter">CART</h2>
            <div className="text-[9px] font-black bg-white/20 px-3 py-1 rounded-full">TAB TO SWITCH</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((item, i) => (
              <div key={item._id} className={`flex items-center justify-between p-5 rounded-[2rem] border-4 transition-all ${cartIndex === i ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-transparent'}`}>
                <div className="flex-1">
                  <h5 className="font-black text-xs uppercase truncate">{item.name}</h5>
                  <p className="text-indigo-600 font-black text-xs mt-1">Rs.{item.price} x {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-slate-50 border-t-2">
            <div className="flex justify-between font-black text-3xl uppercase text-indigo-600 mb-4"><span>Total</span><span>Rs.{finalTotal.toFixed(2)}</span></div>
            <button onClick={() => cart.length > 0 && setShowPaymentModal(true)} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase shadow-xl">COMPLETE (F8)</button>
          </div>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl border-8 border-indigo-600 w-[500px]">
             <h2 className="text-3xl font-black uppercase mb-10 italic">Pay via <span className="text-indigo-600">{paymentMethod}</span></h2>
             <div className="grid grid-cols-2 gap-6 mb-10">
                <div className={`p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                    <Receipt size={48} className="mx-auto mb-2" />
                    <p className="font-black text-xl">CASH</p>
                </div>
                <div className={`p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                    <Receipt size={48} className="mx-auto mb-2" />
                    <p className="font-black text-xl">CARD</p>
                </div>
             </div>
             <div className="bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase text-lg animate-pulse shadow-xl">ENTER TO PRINT</div>
             <p className="mt-4 text-slate-400 font-bold text-xs uppercase">Esc to Exit</p>
          </div>
        </div>
      )}

      <div className="hidden">
        <div ref={printRef}>
          {invoiceData && <PrintableBill {...invoiceData} businessInfo={user} />}
        </div>
      </div>
    </div>
  );
};

export default NewBill;
