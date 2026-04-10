import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Banknote, CreditCard, Trash2, Plus, Minus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Default Cash
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
    setCurrentUser(JSON.parse(localStorage.getItem('currentUser') || '{}'));
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

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFinish = async (method: string) => {
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    try {
      await axios.post('/api/invoices', { invoiceId: invId, items: cart, total, paymentMethod: method, cashier: currentUser?.name || 'Staff' });
      socket.emit('update-data');
      setInvoiceId(invId); setPaymentMethod(method); setShowPayModal(false);
      setTimeout(() => { window.print(); setCart([]); }, 500);
      toast.success("Done!");
    } catch (err) { toast.error("Error!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-black italic text-indigo-600">POS SYSTEM</h2>
            <input autoFocus type="text" placeholder="Search..." className="bg-slate-100 px-4 py-2 rounded-xl outline-none" onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} />
          </div>
          <div className="grid grid-cols-3 gap-4 overflow-y-auto">
            {filteredProducts.map((p, i) => (
              <button key={p._id} onClick={() => addToCart(p)} className={`p-4 rounded-3xl border-2 transition-all text-left ${i === selectedIndex ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50'}`}>
                <p className="font-black uppercase truncate text-sm">{p.name}</p>
                <p className="text-[10px] text-slate-400">CODE: {p.code}</p>
                <p className="text-indigo-600 font-black mt-2">Rs. {p.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white rounded-[3rem] p-6 shadow-xl flex flex-col">
          <h3 className="font-black text-slate-400 text-center mb-4 uppercase">Cart</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map(item => (
              <div key={item._id} className="bg-slate-50 p-4 rounded-2xl">
                <p className="font-bold text-sm uppercase">{item.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border">
                    <button onClick={() => updateQty(item._id, -1)}><Minus size={12}/></button>
                    <span className="font-black text-xs">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)}><Plus size={12}/></button>
                  </div>
                  <p className="font-black text-indigo-600 text-sm">Rs. {item.price * item.quantity}</p>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-6 bg-indigo-600 text-white rounded-[2rem]">
            <div className="flex justify-between font-black text-xl mb-4 italic"><span>TOTAL</span><span>Rs.{total.toLocaleString()}</span></div>
            <button onClick={() => setShowPayModal(true)} disabled={cart.length === 0} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black uppercase text-xs">Pay Now (F9)</button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center">
            <h3 className="font-black mb-6 uppercase">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={() => setPaymentMethod('Cash')} className={`p-6 border-4 rounded-2xl ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 opacity-40'}`}><Banknote className="mx-auto mb-2" /><span className="font-black text-xs">CASH</span></button>
              <button onClick={() => setPaymentMethod('Card')} className={`p-6 border-4 rounded-2xl ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50' : 'border-slate-50 opacity-40'}`}><CreditCard className="mx-auto mb-2" /><span className="font-black text-xs">CARD</span></button>
            </div>
            <button onClick={() => handleFinish(paymentMethod)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase">Confirm & Print (Enter)</button>
          </div>
        </div>
      )}

      {/* Print Fix */}
      <div className="print-area hidden">
        <PrintableBill ref={printRef} invoiceId={invoiceId} cart={cart} total={total} paymentMethod={paymentMethod} businessInfo={businessInfo} currentUser={currentUser} date={new Date().toLocaleDateString()} time={new Date().toLocaleTimeString()} />
      </div>
      <style>{` @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; } } `}</style>
    </div>
  );
};

export default NewBill;
