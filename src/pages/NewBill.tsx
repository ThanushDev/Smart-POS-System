import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { Search, ShoppingCart, Trash2, Receipt } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/products?businessId=' + user.businessId);
      setProducts(res.data);
    };
    fetchData();
    searchInputRef.current?.focus();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const addToCart = (product: any) => {
    if (product.qty <= 0) return toast.error("Out of stock!");
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, unitDiscount: (product.price * (product.discount || 0) / 100) }]);
    }
    setSearchTerm('');
    setSelectedIndex(0);
    // Item eka add karapu gaman search box ekatama focus wenawa
    searchInputRef.current?.focus();
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F2 - Search Focus
      if (e.key === 'F2') {
        e.preventDefault();
        setCartIndex(-1);
        searchInputRef.current?.focus();
      }

      // F8 - Checkout Modal
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setShowPaymentModal(true);
      }

      // Modal Controls
      if (showPaymentModal) {
        if (e.key === 'ArrowLeft') setPaymentMethod('CASH');
        if (e.key === 'ArrowRight') setPaymentMethod('CARD');
        if (e.key === 'Enter') handleCheckout();
        if (e.key === 'Escape') setShowPaymentModal(false);
        return;
      }

      // Search Box Focus wela thiyena welawe
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter' && filteredProducts[selectedIndex]) {
          addToCart(filteredProducts[selectedIndex]);
        }
        // TAB ebuwama Cart ekata yanawa
        if (e.key === 'Tab') {
          if (cart.length > 0) {
            e.preventDefault();
            setCartIndex(0);
            searchInputRef.current?.blur(); // Search focus ain karanawa
          }
        }
      } 
      // Cart eka Select wela thiyena welawe (Tab ebuwata passe)
      else if (cartIndex !== -1) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setCartIndex(prev => (prev < cart.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setCartIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'ArrowRight') updateQty(cart[cartIndex]._id, 1);
        if (e.key === 'ArrowLeft') updateQty(cart[cartIndex]._id, -1);
        if (e.key === 'Delete') {
            const newCart = cart.filter((_, i) => i !== cartIndex);
            setCart(newCart);
            if (newCart.length === 0) { setCartIndex(-1); searchInputRef.current?.focus(); }
            else if (cartIndex >= newCart.length) { setCartIndex(newCart.length - 1); }
        }
        if (e.key === 'Escape') {
            setCartIndex(-1);
            searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [filteredProducts, selectedIndex, cart, cartIndex, showPaymentModal, paymentMethod]);

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + (item.unitDiscount * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      setCart([]);
      setInvoiceData(null);
      setCartIndex(-1);
      searchInputRef.current?.focus();
    }
  });

  const handleCheckout = async () => {
    const invId = `INV-${Date.now()}`;
    const newInvoice = {
      invoiceId: invId,
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
      setShowPaymentModal(false);
      toast.success("Printing...");
      setTimeout(() => handlePrint(), 500);
    } catch (err) { toast.error("Database Error!"); }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden italic">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Search Section */}
        <div className="flex-[1.5] flex flex-col">
          <div className={`bg-white p-6 rounded-[2rem] shadow-md flex items-center gap-4 mb-4 border-4 transition-all ${cartIndex === -1 ? 'border-indigo-500' : 'border-transparent opacity-60'}`}>
            <Search className="text-indigo-600" size={24} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="F2: SEARCH NAME OR CODE" 
              className="flex-1 outline-none font-black text-xl uppercase placeholder:text-slate-300" 
              value={searchTerm} 
              onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} 
            />
          </div>

          <div className="space-y-2 overflow-y-auto pr-2">
            {searchTerm && filteredProducts.map((p, index) => (
              <div 
                key={p._id} 
                className={`p-5 rounded-3xl flex justify-between items-center transition-all ${selectedIndex === index && cartIndex === -1 ? 'bg-indigo-600 text-white shadow-2xl scale-[1.03]' : 'bg-white text-slate-600'}`}
              >
                <div>
                  <h4 className="font-black text-sm uppercase">{p.name}</h4>
                  <p className={`text-[10px] font-bold ${selectedIndex === index ? 'text-indigo-100' : 'text-slate-400'}`}>{p.code} | STOCK: {p.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">Rs.{p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
          <div className={`p-6 transition-all ${cartIndex !== -1 ? 'bg-amber-500' : 'bg-slate-800'} text-white flex justify-between items-center`}>
            <h2 className="text-xl font-black uppercase tracking-tighter">
                {cartIndex !== -1 ? 'ADJUSTING QUANTITY' : 'CART'}
            </h2>
            <div className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase">TAB TO TOGGLE</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic">
                    <ShoppingCart size={64} className="mb-4 opacity-20" />
                    <p className="font-black uppercase">Cart is Empty</p>
                </div>
            ) : cart.map((item, index) => (
              <div 
                key={item._id} 
                className={`flex items-center justify-between p-5 rounded-[2rem] transition-all border-4 ${cartIndex === index ? 'bg-indigo-50 border-indigo-500 shadow-xl scale-[1.02]' : 'bg-slate-50 border-transparent'}`}
              >
                <div className="flex-1">
                  <h5 className={`font-black text-xs uppercase truncate ${cartIndex === index ? 'text-indigo-700' : 'text-slate-800'}`}>{item.name}</h5>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-[11px] font-black text-indigo-600">Rs.{item.price}</p>
                    <div className={`px-3 py-1 rounded-full font-black text-[12px] ${cartIndex === index ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-slate-500'}`}>
                      QTY: {item.quantity}
                    </div>
                  </div>
                </div>
                {cartIndex === index && (
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-2">
                             <div className="bg-indigo-600 text-white p-1 rounded-md"><Plus size={12}/></div>
                             <div className="bg-indigo-600 text-white p-1 rounded-md"><Minus size={12}/></div>
                        </div>
                        <span className="text-[8px] font-black text-indigo-400 uppercase">Use Arrows</span>
                    </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-50 border-t-2 space-y-3">
            <div className="flex justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest"><span>Savings</span><span>Rs.{discountTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-3xl uppercase text-indigo-600"><span>Total</span><span>Rs.{finalTotal.toFixed(2)}</span></div>
            <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase shadow-2xl mt-4 active:scale-95 transition-transform">
                F8: COMPLETE BILL
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl border-8 border-indigo-600 w-[500px]">
             <h2 className="text-3xl font-black uppercase mb-10 italic">Payment <span className="text-indigo-600">Type</span></h2>
             <div className="grid grid-cols-2 gap-6 mb-10">
                <div className={`p-10 rounded-[3rem] border-4 transition-all cursor-pointer ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-110' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'}`}>
                    <Receipt size={48} className="mx-auto mb-4" />
                    <p className="font-black text-xl">CASH</p>
                </div>
                <div className={`p-10 rounded-[3rem] border-4 transition-all cursor-pointer ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl scale-110' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'}`}>
                    <Receipt size={48} className="mx-auto mb-4" />
                    <p className="font-black text-xl">CARD</p>
                </div>
             </div>
             <div className="bg-indigo-50 p-4 rounded-2xl font-black text-indigo-600 uppercase text-sm">
                Press ENTER to Finalize & Print
             </div>
          </div>
        </div>
      )}

      {/* Print Holder */}
      <div className="hidden">
        <div ref={printRef}>
          {invoiceData && <PrintableBill {...invoiceData} businessInfo={user} />}
        </div>
      </div>
    </div>
  );
};

// Add Plus/Minus for visual helper in code (optional, imported from lucide)
const Plus = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Minus = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default NewBill;
