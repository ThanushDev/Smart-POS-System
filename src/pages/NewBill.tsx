import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Banknote, CreditCard, Trash2, Plus, Minus, Search, X, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0); // Admin Discount State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [busRes, prodRes] = await Promise.all([axios.get('/api/business'), axios.get('/api/products')]);
      setBusinessInfo(busRes.data);
      setProducts(prodRes.data);
    };
    // Local storage එකෙන් user දත්ත ලබා ගැනීම
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    fetchData();
    socket.on('update-sync', fetchData);
    return () => { socket.off('update-sync'); };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPayModal) {
        if (e.key === 'Enter') handleFinish(paymentMethod);
        if (e.key === 'ArrowRight') setPaymentMethod('Card');
        if (e.key === 'ArrowLeft') setPaymentMethod('Cash');
        if (e.key === 'Escape') setShowPayModal(false);
        return;
      }
      if (e.key === 'ArrowDown') setSelectedIndex(p => Math.min(p + 3, filteredProducts.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(p => Math.max(p - 3, 0));
      if (e.key === 'Enter' && filteredProducts[selectedIndex]) addToCart(filteredProducts[selectedIndex]);
      if (e.key === 'F9') setShowPayModal(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredProducts, showPayModal, paymentMethod]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  // ගණනය කිරීම්
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subTotal - discount;

  const handleFinish = async (method: string) => {
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    try {
      // Backend එකට Discount දත්තත් සමඟ යැවීම
      await axios.post('/api/invoices', { 
        invoiceId: invId, 
        items: cart, 
        total: finalTotal, 
        discountTotal: discount,
        paymentMethod: method, 
        cashier: currentUser?.name || 'Staff' 
      });
      
      socket.emit('update-data');
      setInvoiceId(invId); 
      setPaymentMethod(method); 
      setShowPayModal(false);
      
      // Print කිරීමට පෙර දත්ත Update වීමට සුළු වෙලාවක් ලබා දීම
      setTimeout(() => { 
        window.print(); 
        setCart([]); 
        setDiscount(0); // Reset discount after sale
      }, 500);
      
      toast.success("Sale Completed!");
    } catch (err) { toast.error("Error completing sale!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex justify-between mb-6 items-center">
            <h2 className="text-2xl font-black italic text-indigo-600 uppercase tracking-tighter">New Bill</h2>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input autoFocus type="text" placeholder="Search..." className="bg-slate-100 pl-10 pr-4 py-2 rounded-xl outline-none font-bold" onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} />
               </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((p, i) => (
              <button key={p._id} onClick={() => addToCart(p)} className={`p-5 rounded-[2rem] border-2 transition-all text-left ${i === selectedIndex ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                <p className="font-black uppercase truncate text-xs">{p.name}</p>
                <p className="text-[9px] text-slate-400 font-bold">CODE: {p.code}</p>
                <p className="text-indigo-600 font-black mt-2">Rs. {p.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white rounded-[3rem] p-6 shadow-xl flex flex-col">
          <h3 className="font-black text-slate-400 text-center mb-4 uppercase text-xs tracking-widest">Current Cart</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {cart.map(item => (
              <div key={item._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="font-black text-[11px] uppercase truncate">{item.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-slate-200">
                    <button onClick={() => updateQty(item._id, -1)} className="text-slate-400 hover:text-indigo-600"><Minus size={12}/></button>
                    <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)} className="text-slate-400 hover:text-indigo-600"><Plus size={12}/></button>
                  </div>
                  <p className="font-black text-slate-800 text-xs">Rs. {item.price * item.quantity}</p>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Discount Section */}
          {currentUser?.role === 'Admin' && (
            <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-orange-600" />
                <span className="text-[10px] font-black uppercase text-orange-600">Admin Discount (Rs.)</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="flex-1 bg-white px-3 py-2 rounded-xl outline-none font-black text-orange-600 text-sm"
                  placeholder="0.00"
                />
                <button onClick={() => setDiscount(0)} className="bg-orange-200 p-2 rounded-xl text-orange-700">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-lg shadow-indigo-100">
            <div className="space-y-1 mb-4">
               <div className="flex justify-between text-[10px] font-bold opacity-80 uppercase"><span>Subtotal</span><span>Rs.{subTotal}</span></div>
               {discount > 0 && (
                 <div className="flex justify-between text-[10px] font-bold text-orange-300 uppercase"><span>Discount</span><span>- Rs.{discount}</span></div>
               )}
               <div className="flex justify-between font-black text-2xl italic pt-2 border-t border-indigo-500/50"><span>TOTAL</span><span>Rs.{finalTotal.toLocaleString()}</span></div>
            </div>
            <button onClick={() => setShowPayModal(true)} disabled={cart.length === 0} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-colors">Pay Now (F9)</button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-sm text-center shadow-2xl">
            <h3 className="font-black mb-8 uppercase tracking-widest text-slate-400 text-xs">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setPaymentMethod('Cash')} className={`p-8 border-4 rounded-[2.5rem] transition-all ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50 text-slate-300'}`}><Banknote className="mx-auto mb-3" size={32} /><span className="font-black text-xs">CASH</span></button>
              <button onClick={() => setPaymentMethod('Card')} className={`p-8 border-4 rounded-[2.5rem] transition-all ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-50 text-slate-300'}`}><CreditCard className="mx-auto mb-3" size={32} /><span className="font-black text-xs">CARD</span></button>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={() => handleFinish(paymentMethod)} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100">Confirm & Print</button>
               <button onClick={() => setShowPayModal(false)} className="text-slate-400 font-bold text-[10px] uppercase hover:text-slate-600">Cancel (Esc)</button>
            </div>
          </div>
        </div>
      )}

      {/* Standard 80mm Print Area */}
      <div className="print-area hidden">
        <PrintableBill 
          ref={printRef} 
          invoiceId={invoiceId} 
          cart={cart} 
          total={finalTotal} 
          discountTotal={discount}
          paymentMethod={paymentMethod} 
          businessInfo={businessInfo} 
          currentUser={currentUser} 
          date={new Date().toLocaleDateString()} 
          time={new Date().toLocaleTimeString()} 
        />
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
