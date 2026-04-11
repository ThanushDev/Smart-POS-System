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
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [busRes, prodRes] = await Promise.all([
        axios.get('/api/business'), 
        axios.get('/api/products')
      ]);
      setBusinessInfo(busRes.data);
      setProducts(prodRes.data);
    };

    // User දත්ත ලබා ගැනීම
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    fetchData();
    socket.on('update-sync', fetchData);
    return () => { socket.off('update-sync'); };
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    const unitDiscount = product.discount ? (product.price * product.discount / 100) : 0;
    
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, unitDiscount }]);
    }
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.unitDiscount * item.quantity), 0);
  const finalTotal = subTotal - totalDiscount;

  const handleFinish = async (method: string) => {
    const invId = `INV-${Date.now().toString().slice(-6)}`;
    
    // වැදගත්: Login වී සිටින User ගේ නම මෙතැනදී ලබා ගනී
    const cashierName = currentUser?.name || 'Admin';

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
      await axios.post('/api/invoices', { 
        invoiceId: invId, 
        items: cart, 
        total: finalTotal, 
        discountTotal: totalDiscount,
        paymentMethod: method, 
        cashier: cashierName // Database එකට යන නම
      });
      
      socket.emit('update-data');
      setShowPayModal(false);
      
      setTimeout(() => { 
        window.print(); 
        setCart([]); 
        setPrintData(null);
      }, 800);
      
      toast.success(`Done by ${cashierName}`);
    } catch (err) { toast.error("Error Saving!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col border border-slate-100">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-black italic text-indigo-600 uppercase tracking-tighter">POINT OF SALE</h2>
            <input autoFocus type="text" placeholder="Search (F1)..." className="bg-slate-100 px-4 py-2 rounded-xl outline-none font-bold" onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} />
          </div>
          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((p, i) => (
              <button key={p._id} onClick={() => addToCart(p)} className={`p-5 rounded-[2rem] border-2 transition-all text-left ${i === selectedIndex ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-transparent bg-slate-50'}`}>
                <p className="font-black uppercase truncate text-xs">{p.name}</p>
                {p.discount > 0 && <p className="text-[10px] text-orange-500 font-black italic">{p.discount}% OFF</p>}
                <p className="text-indigo-600 font-black mt-2">Rs. {p.price}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white rounded-[3rem] p-6 shadow-xl flex flex-col border border-slate-100">
          <h3 className="font-black text-slate-400 text-center mb-4 uppercase text-[10px] tracking-widest">Shopping Cart</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map(item => (
              <div key={item._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-start">
                  <p className="font-black text-[11px] uppercase truncate w-32">{item.name}</p>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-400"><Trash2 size={14}/></button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold">Qty: {item.quantity}</span>
                  <p className="font-black text-indigo-600 text-xs">Rs. {(item.price - item.unitDiscount) * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-lg">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[10px] font-bold opacity-70"><span>SUBTOTAL</span><span>Rs.{subTotal}</span></div>
              <div className="flex justify-between text-[10px] font-bold text-orange-300"><span>DISCOUNT</span><span>- Rs.{totalDiscount}</span></div>
              <div className="flex justify-between font-black text-2xl pt-2 border-t border-indigo-400/50 mt-2 italic"><span>TOTAL</span><span>Rs.{finalTotal}</span></div>
            </div>
            <button onClick={() => setShowPayModal(true)} disabled={cart.length === 0} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest">Pay Now (F9)</button>
          </div>
        </div>
      </main>

      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-sm text-center">
            <h3 className="font-black mb-8 uppercase text-slate-400 text-[10px]">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setPaymentMethod('Cash')} className={`p-8 border-4 rounded-[2.5rem] ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50'}`}><Banknote className="mx-auto mb-2" /><span className="font-black text-xs">CASH</span></button>
              <button onClick={() => setPaymentMethod('Card')} className={`p-8 border-4 rounded-[2.5rem] ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-50'}`}><CreditCard className="mx-auto mb-2" /><span className="font-black text-xs">CARD</span></button>
            </div>
            <button onClick={() => handleFinish(paymentMethod)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100">Confirm & Print</button>
          </div>
        </div>
      )}

      <div className="print-area hidden">
        {printData && <PrintableBill ref={printRef} {...printData} />}
      </div>

      <style>{` @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 80mm; } } `}</style>
    </div>
  );
};

export default NewBill;
