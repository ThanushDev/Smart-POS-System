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
  const [selectedIndex, setSelectedIndex] = useState(0); // Search selection
  const [cartIndex, setCartIndex] = useState(-1); // Cart selection
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

  // Filtered products list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8); // Display top 8 results

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
  };

  // Keyboard Shortcuts & Navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') { // Focus Search
        e.preventDefault();
        setCartIndex(-1);
        searchInputRef.current?.focus();
      }
      if (e.key === 'F8') { // Checkout
        e.preventDefault();
        if (cart.length > 0) setShowPaymentModal(true);
      }

      if (showPaymentModal) {
        if (e.key === 'ArrowLeft') setPaymentMethod('CASH');
        if (e.key === 'ArrowRight') setPaymentMethod('CARD');
        if (e.key === 'Enter') handleCheckout();
        if (e.key === 'Escape') setShowPaymentModal(false);
        return;
      }

      // Search Navigation
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : prev));
        if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        if (e.key === 'Enter' && filteredProducts[selectedIndex]) {
          addToCart(filteredProducts[selectedIndex]);
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          if (cart.length > 0) setCartIndex(0);
        }
      } 
      // Cart Navigation
      else if (cartIndex !== -1) {
        if (e.key === 'ArrowDown') setCartIndex(prev => (prev < cart.length - 1 ? prev + 1 : prev));
        if (e.key === 'ArrowUp') setCartIndex(prev => (prev > 0 ? prev - 1 : prev));
        if (e.key === 'ArrowRight') updateQty(cart[cartIndex]._id, 1);
        if (e.key === 'ArrowLeft') updateQty(cart[cartIndex]._id, -1);
        if (e.key === 'Delete') setCart(cart.filter((_, i) => i !== cartIndex));
        if (e.key === 'Escape') { setCartIndex(-1); searchInputRef.current?.focus(); }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [filteredProducts, selectedIndex, cart, cartIndex, showPaymentModal, paymentMethod]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + (item.unitDiscount * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      setCart([]);
      setInvoiceData(null);
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
      toast.success("Bill Generated!");
      setTimeout(() => handlePrint(), 500);
    } catch (err) { toast.error("Error saving invoice"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden italic">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* Left Side: Search & Results */}
        <div className="flex-[1.5] flex flex-col">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4 mb-4 border-2 border-indigo-100">
            <Search className="text-indigo-600" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search Name / Code (F2)" 
              className="flex-1 outline-none font-black text-lg uppercase" 
              value={searchTerm} 
              onChange={(e) => {setSearchTerm(e.target.value); setSelectedIndex(0);}} 
            />
            <div className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-400">ESC TO UNFOCUS</div>
          </div>

          <div className="space-y-2">
            {searchTerm && filteredProducts.map((p, index) => (
              <div 
                key={p._id} 
                className={`p-4 rounded-2xl flex justify-between items-center transition-all ${selectedIndex === index ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'bg-white text-slate-600 border border-slate-100'}`}
              >
                <div>
                  <h4 className="font-black text-sm uppercase">{p.name}</h4>
                  <p className={`text-[10px] font-bold ${selectedIndex === index ? 'text-indigo-200' : 'text-slate-400'}`}>{p.code} | Stock: {p.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">Rs.{p.price.toFixed(2)}</p>
                  {selectedIndex === index && <span className="text-[9px] font-black animate-pulse uppercase">Press Enter to Add</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col border border-slate-100 overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter">Cart <span className="text-indigo-200 text-xs ml-2">TAB TO NAVIGATE</span></h2>
            <ShoppingCart size={20} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.map((item, index) => (
              <div key={item._id} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${cartIndex === index ? 'bg-amber-50 border-2 border-amber-400' : 'bg-slate-50'}`}>
                <div className="flex-1">
                  <h5 className="font-black text-[11px] uppercase truncate">{item.name}</h5>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-[10px] font-black text-indigo-600">Rs.{item.price}</p>
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border">
                      <span className="text-[10px] font-black">QTY: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                {cartIndex === index && <div className="text-[8px] font-black text-amber-600 uppercase">Arrows to Adjust</div>}
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-50 border-t space-y-3">
            <div className="flex justify-between font-bold text-xs text-slate-400 uppercase"><span>Total Savings</span><span>Rs.{discountTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-2xl uppercase text-indigo-600"><span>Net Total</span><span>Rs.{finalTotal.toFixed(2)}</span></div>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg">Complete Bill (F8)</button>
          </div>
        </div>
      </main>

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200]">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-2xl border-4 border-indigo-500">
            <h2 className="text-3xl font-black uppercase mb-8 italic">Select <span className="text-indigo-600">Payment</span></h2>
            <div className="flex gap-8 justify-center mb-10">
              <div className={`p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Receipt size={48} className="mx-auto mb-4" />
                <span className="font-black text-xl">CASH</span>
              </div>
              <div className={`p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'CARD' ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <Receipt size={48} className="mx-auto mb-4" />
                <span className="font-black text-xl">CARD</span>
              </div>
            </div>
            <p className="text-slate-400 font-black uppercase text-sm animate-bounce">Press Enter to Print Bill</p>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        <div ref={printRef}>
          {invoiceData && <PrintableBill {...invoiceData} businessInfo={user} />}
        </div>
      </div>
    </div>
  );
};

export default NewBill;
