import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Banknote, CreditCard, Trash2, Plus, Minus, Search, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busRes, prodRes] = await Promise.all([axios.get('/api/business'), axios.get('/api/products')]);
        setBusinessInfo(busRes.data);
        setProducts(prodRes.data);
      } catch (err) { toast.error("Sync error!"); }
    };
    const savedUser = localStorage.getItem('user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchData();
    socket.on('update-sync', fetchData);
    return () => { socket.off('update-sync'); };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPayModal) {
        if (e.key === 'Enter') { e.preventDefault(); handleFinish(paymentMethod); }
        if (e.key === 'ArrowRight') setPaymentMethod('Card');
        if (e.key === 'ArrowLeft') setPaymentMethod('Cash');
        if (e.key === 'Escape') setShowPayModal(false);
        return;
      }

      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 3, filteredProducts.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 3, 0)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, 0)); }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredProducts[selectedIndex]) addToCart(filteredProducts[selectedIndex]);
      }
      
      if (e.key === 'F9') { e.preventDefault(); if(cart.length > 0) setShowPayModal(true); }
      if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredProducts, showPayModal, paymentMethod, cart]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    const unitDiscount = product.discount ? (product.price * product.discount / 100) : 0;
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, unitDiscount, originalPrice: product.price }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.unitDiscount * item.quantity), 0);
  const finalTotal = subTotal - totalDiscount;

  const handleFinish = async (method: string) => {
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    const cashierName = currentUser?.name || 'Staff';
    const currentPrintData = {
      invoiceId: invId,
      cart: [...cart],
      total: finalTotal,
      discountTotal: totalDiscount,
      paymentMethod: method,
      businessInfo,
      currentUser: { name: cashierName },
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    setPrintData(currentPrintData);
    try {
      await axios.post('/api/invoices', { invoiceId: invId, items: cart, total: finalTotal, discountTotal: totalDiscount, paymentMethod: method, cashier: cashierName });
      socket.emit('update-data');
      setShowPayModal(false);
      setTimeout(() => { window.print(); setCart([]); setPrintData(null); }, 500);
      toast.success("Invoice Printed!");
    } catch (err) { toast.error("Submission failed!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        {/* PRODUCTS SECTION */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col border border-slate-100">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-black italic text-indigo-600 tracking-tighter uppercase">Point of Sale</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input ref={searchInputRef} type="text" placeholder="Search Item (F1)..." className="bg-slate-50 pl-10 pr-4 py-2 rounded-xl outline-none font-bold w-64 border border-transparent focus:border-indigo-100 transition-all" onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((p, i) => (
              <button key={p._id} onClick={() => addToCart(p)} className={`p-5 rounded-[2rem] border-2 transition-all text-left relative group ${i === selectedIndex ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-4 ring-indigo-100 scale-[1.02]' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex justify-between items-start">
                   <p className="font-black uppercase text-[11px] text-slate-800 truncate w-3/4">{p.name}</p>
                   {p.discount > 0 && <Tag size={14} className="text-emerald-500 fill-emerald-50" />}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">#{p.code}</p>
                
                <div className="mt-3 flex items-baseline gap-2">
                   <p className="text-indigo-600 font-black text-lg italic">Rs.{p.price - (p.price * (p.discount || 0) / 100)}</p>
                   {p.discount > 0 && <span className="text-[10px] text-slate-300 line-through font-bold">Rs.{p.price}</span>}
                </div>
                
                {p.discount > 0 && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase">-{p.discount}%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CART SECTION */}
        <div className="w-[400px] bg-white rounded-[3rem] p-6 shadow-xl flex flex-col border border-slate-100">
          <h3 className="font-black text-slate-400 text-center mb-4 uppercase text-[10px] tracking-[0.2em]">Current Order</h3>
          <div className="flex-1 overflow-y-auto space-y-3 px-1">
            {cart.map(item => (
              <div key={item._id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-[12px] uppercase text-slate-800">{item.name}</p>
                    <p className="text-[9px] font-bold text-slate-400">CODE: {item.code}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => updateQty(item._id, -1)} className="text-indigo-600 hover:bg-indigo-50 rounded-md p-0.5"><Minus size={14}/></button>
                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)} className="text-indigo-600 hover:bg-indigo-50 rounded-md p-0.5"><Plus size={14}/></button>
                  </div>
                  <div className="text-right">
                     <p className="font-black text-indigo-600 text-sm italic">Rs.{(item.price - item.unitDiscount) * item.quantity}</p>
                     {item.unitDiscount > 0 && <p className="text-[9px] font-bold text-emerald-500">SAVED Rs.{item.unitDiscount * item.quantity}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl">
            <div className="space-y-1 mb-4">
               <div className="flex justify-between text-slate-400 text-[10px] font-bold uppercase tracking-widest"><span>Subtotal</span><span>Rs.{subTotal}</span></div>
               <div className="flex justify-between text-emerald-400 text-[10px] font-bold uppercase tracking-widest"><span>Discount</span><span>- Rs.{totalDiscount}</span></div>
            </div>
            <div className="flex justify-between font-black text-3xl mb-6 italic tracking-tighter"><span>TOTAL</span><span>Rs.{finalTotal}</span></div>
            <button onClick={() => setShowPayModal(true)} disabled={cart.length === 0} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale">Checkout (F9)</button>
          </div>
        </div>
      </main>

      {/* PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-200">
            <h3 className="font-black mb-8 uppercase text-slate-400 text-[10px] tracking-widest">Select Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setPaymentMethod('Cash')} className={`p-8 border-4 rounded-[3rem] transition-all ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-slate-50 hover:bg-slate-50'}`}>
                <Banknote className={`mx-auto mb-2 ${paymentMethod === 'Cash' ? 'text-emerald-500' : 'text-slate-300'}`} size={32} />
                <span className={`font-black uppercase text-[10px] ${paymentMethod === 'Cash' ? 'text-emerald-700' : 'text-slate-400'}`}>Cash</span>
              </button>
              <button onClick={() => setPaymentMethod('Card')} className={`p-8 border-4 rounded-[3rem] transition-all ${paymentMethod === 'Card' ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-slate-50 hover:bg-slate-50'}`}>
                <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'Card' ? 'text-indigo-500' : 'text-slate-300'}`} size={32} />
                <span className={`font-black uppercase text-[10px] ${paymentMethod === 'Card' ? 'text-indigo-700' : 'text-slate-400'}`}>Card</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPayModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={() => handleFinish(paymentMethod)} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-indigo-200">Confirm & Print</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT AREA */}
      <div className="print-area hidden">
        {printData && <PrintableBill {...printData} />}
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 80mm; }
        }
      `}</style>
    </div>
  );
};

export default NewBill;
