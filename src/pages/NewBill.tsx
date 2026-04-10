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
  const [invoiceId, setInvoiceId] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const res = await axios.get('/api/business');
        setBusinessInfo(res.data);
      } catch (err) {
        console.error("Business info fetch error");
      }
    };

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    const fetchProducts = async () => {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    };

    fetchBusinessData();
    fetchProducts();

    socket.on('update-sync', () => fetchProducts());
    return () => { socket.off('update-sync'); };
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
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

      const lowStockItems = cart.filter(item => (item.qty - item.quantity) <= 5);
      if (lowStockItems.length > 0) {
        await axios.post('/api/alerts/whatsapp', { 
          items: lowStockItems.map(i => i.name) 
        });
      }

      setInvoiceId(invId);
      setPaymentMethod(method);
      setShowPayModal(false);
      
      setTimeout(() => { 
        window.print(); 
        setCart([]); 
      }, 500);
      
      toast.success("Bill Processed Successfully!");

    } catch (err) {
      toast.error("Error finalizing transaction");
    }
  };

  // භාණ්ඩ නම හෝ බාර්කෝඩ් කේතය අනුව සෙවීමේ තර්කය (Search Logic)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-6 overflow-hidden">
        
        {/* Product Selection Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black italic text-indigo-600 uppercase">Digi Solutions POS</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Name or Code..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl outline-none font-bold italic"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map(product => (
              <button 
                key={product._id} 
                onClick={() => addToCart(product)}
                className="p-4 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-indigo-600 transition-all text-left group"
              >
                <p className="font-black text-slate-800 uppercase group-hover:text-indigo-600 truncate">{product.name}</p>
                {/* භාණ්ඩයේ කේතය (Product Code) මෙතැන පෙන්වයි */}
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">CODE: {product.code}</p>
                
                <div className="mt-3 flex justify-between items-end">
                  <p className="text-indigo-600 font-black italic">Rs. {product.price}</p>
                  <p className={`text-[10px] font-bold uppercase ${product.qty <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                    Stock: {product.qty}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Area */}
        <div className="w-96 bg-white rounded-[3rem] shadow-xl flex flex-col p-6 border border-slate-100">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-center mb-4">Current Order</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <div className="flex-1">
                  <p className="font-bold text-sm uppercase truncate">{item.name}</p>
                  <p className="text-[10px] font-black text-slate-400 mb-1">{item.code}</p>
                  <p className="text-xs text-indigo-500 font-bold">Rs.{item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-500 p-2"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-8 bg-indigo-50 rounded-[2.5rem] space-y-4">
            <div className="flex justify-between text-2xl font-black italic">
              <span>TOTAL</span>
              <span>Rs.{total.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setShowPayModal(true)} 
              disabled={cart.length === 0}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all"
            >
              FINALIZE PAYMENT
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl border-t-8 border-indigo-600">
            <h3 className="text-xl font-black mb-8 italic uppercase text-slate-800">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleFinish('Cash')} className="p-6 border-4 border-slate-50 rounded-[2rem] hover:border-emerald-500 transition-all group">
                <Banknote size={40} className="mx-auto text-slate-300 group-hover:text-emerald-500 mb-2" />
                <span className="font-black">CASH</span>
              </button>
              <button onClick={() => handleFinish('Card')} className="p-6 border-4 border-slate-50 rounded-[2rem] hover:border-blue-500 transition-all group">
                <CreditCard size={40} className="mx-auto text-slate-300 group-hover:text-blue-500 mb-2" />
                <span className="font-black">CARD</span>
              </button>
            </div>
            <button onClick={() => setShowPayModal(false)} className="mt-8 text-slate-400 font-bold uppercase text-xs">Cancel Transaction</button>
          </div>
        </div>
      )}

      {/* Hidden Print Section */}
      <div className="hidden">
        <PrintableBill 
          ref={printRef} 
          invoiceId={invoiceId} 
          cart={cart} 
          total={total} 
          paymentMethod={paymentMethod} 
          businessInfo={businessInfo} 
          currentUser={currentUser} 
          date={new Date().toLocaleDateString()} 
          time={new Date().toLocaleTimeString()} 
        />
      </div>
    </div>
  );
};

export default NewBill;
