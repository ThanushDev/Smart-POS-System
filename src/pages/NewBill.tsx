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
  const [selectedIndex, setSelectedIndex] = useState(0); // Keyboard navigation සඳහා
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busRes, prodRes] = await Promise.all([
          axios.get('/api/business'),
          axios.get('/api/products')
        ]);
        setBusinessInfo(busRes.data);
        setProducts(prodRes.data);
      } catch (err) { console.error("Fetch error"); }
    };
    
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    fetchData();

    socket.on('update-sync', () => fetchData());
    return () => { socket.off('update-sync'); };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Keyboard Shortcuts Handle කිරීම
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPayModal) {
        if (e.key === 'Enter') handleFinish(paymentMethod);
        if (e.key === 'ArrowRight') setPaymentMethod('Card');
        if (e.key === 'ArrowLeft') setPaymentMethod('Cash');
        if (e.key === 'Escape') setShowPayModal(false);
        return;
      }

      if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 3, filteredProducts.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 3, 0));
      if (e.key === 'ArrowRight') setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      if (e.key === 'ArrowLeft') setSelectedIndex(prev => Math.max(prev - 1, 0));
      if (e.key === 'Enter' && filteredProducts[selectedIndex]) addToCart(filteredProducts[selectedIndex]);
      if (e.key === 'F9') setShowPayModal(true); // F9 වලින් කෙලින්ම Payment වලට
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
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleFinish = async (method: string) => {
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    try {
      await axios.post('/api/invoices', { 
        invoiceId: invId, 
        items: cart, 
        total, 
        paymentMethod: method, 
        cashier: currentUser?.name || 'Staff' 
      });

      socket.emit('update-data');
      setInvoiceId(invId);
      setPaymentMethod(method);
      setShowPayModal(false);
      
      // Print Dialog එක පෙන්වීමට පෙර සුළු වෙලාවක් ලබා දීම
      setTimeout(() => { 
        window.print(); 
        setCart([]); 
      }, 500);
      
      toast.success("Transaction Completed!");
    } catch (err) { toast.error("Processing failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        
        {/* Product Selection Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic text-indigo-600 uppercase">New Bill</h2>
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search (Arrow Keys to Move)..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none font-bold italic"
                onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}}
              />
            </div>
          </header>

          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((product, idx) => (
              <button 
                key={product._id} 
                onClick={() => addToCart(product)}
                className={`p-4 rounded-3xl border-2 transition-all text-left group ${idx === selectedIndex ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-transparent bg-slate-50'}`}
              >
                <p className="font-black text-slate-800 uppercase truncate">{product.name}</p>
                <p className="text-[10px] font-black text-slate-400 tracking-widest">CODE: {product.code}</p>
                <div className="mt-3 flex justify-between items-end">
                  <p className="text-indigo-600 font-black italic">Rs. {product.price}</p>
                  <p className="text-[10px] font-bold text-slate-400">Stock: {product.qty}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart/Summary Area */}
        <div className="w-96 bg-white rounded-[3rem] shadow-xl flex flex-col p-6 border border-slate-100">
          <h3 className="font-black text-slate-400 uppercase text-center mb-4 tracking-widest">Items In Cart</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map((item) => (
              <div key={item._id} className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm uppercase truncate flex-1">{item.name}</p>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-500 ml-2"><Trash2 size={16}/></button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border border-slate-100">
                    <button onClick={() => updateQty(item._id, -1)} className="text-indigo-600"><Minus size={14}/></button>
                    <span className="font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)} className="text-indigo-600"><Plus size={14}/></button>
                  </div>
                  <p className="font-black text-indigo-600">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200">
            <div className="flex justify-between text-2xl font-black italic mb-4">
              <span>TOTAL</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setShowPayModal(true)} 
              disabled={cart.length === 0}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-sm tracking-widest active:scale-95 transition-all"
            >
              Pay Now (F9)
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-md text-center shadow-2xl">
            <h3 className="text-xl font-black mb-8 italic uppercase">Complete Payment</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setPaymentMethod('Cash')} 
                className={`p-6 border-4 rounded-[2rem] transition-all flex flex-col items-center ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 opacity-50'}`}
              >
                <Banknote size={40} className={paymentMethod === 'Cash' ? 'text-emerald-500' : 'text-slate-300'} />
                <span className="font-black mt-2">CASH (←)</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('Card')} 
                className={`p-6 border-4 rounded-[2rem] transition-all flex flex-col items-center ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50' : 'border-slate-50 opacity-50'}`}
              >
                <CreditCard size={40} className={paymentMethod === 'Card' ? 'text-blue-500' : 'text-slate-300'} />
                <span className="font-black mt-2">CARD (→)</span>
              </button>
            </div>
            <button onClick={() => handleFinish(paymentMethod)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest mb-4">Confirm & Print (Enter)</button>
            <button onClick={() => setShowPayModal(false)} className="text-slate-400 font-bold uppercase text-[10px]">Back to Order (Esc)</button>
          </div>
        </div>
      )}

      {/* Printable Section Fix */}
      <div className="print-area hidden">
        <PrintableBill 
          ref={printRef} invoiceId={invoiceId} cart={cart} total={total} 
          paymentMethod={paymentMethod} businessInfo={businessInfo} 
          currentUser={currentUser} date={new Date().toLocaleDateString()} time={new Date().toLocaleTimeString()} 
        />
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default NewBill;
