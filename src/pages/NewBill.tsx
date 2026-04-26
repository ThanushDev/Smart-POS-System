import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User details ලබා ගැනීම
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const businessId = user.role === 'Admin' ? user._id : user.businessId;

  useEffect(() => {
    fetchData();
    searchInputRef.current?.focus();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { 'business-id': businessId }
      });
      setProducts(res.data);
    } catch (err) { toast.error("Error loading products"); }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const foundProduct = products.find(p => p.code === value);
    if (foundProduct) {
      addToCart(foundProduct);
      setSearchTerm('');
    }
  };

  const addToCart = (product: any) => {
    if (product.qty <= 0) return toast.error("Out of stock!");
    setCart(currentCart => {
      const existing = currentCart.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.qty) {
          toast.warn("Max stock reached");
          return currentCart;
        }
        return currentCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => current.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        const originalProduct = products.find(p => p._id === id);
        if (newQty > 0 && newQty <= (originalProduct?.qty || 0)) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((acc, item) => acc + ((item.price * (item.discount / 100)) * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const invoiceData = {
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      items: cart,
      total: finalTotal,
      discountTotal: discountTotal,
      cashier: user.name,
      businessId: businessId, // Shop isolation
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    try {
      await axios.post('/api/invoices', invoiceData);
      toast.success("Bill Processed Successfully!");
      setCart([]);
      fetchData(); // Stock update වූ පසු නැවත load කිරීම
    } catch (err) {
      toast.error("Checkout failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-8">
        <div className="flex-1">
          <header className="mb-8">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">New <span className="text-indigo-600">Bill</span></h1>
          </header>

          <div className="relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Scan Barcode or Search Name..." 
              className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none font-bold text-lg focus:ring-4 ring-indigo-50 transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <button 
                key={product._id}
                onClick={() => addToCart(product)}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 text-left hover:border-indigo-200 transition-all group shadow-sm"
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{product.code}</p>
                <h3 className="font-black text-slate-800 uppercase italic leading-tight mb-2">{product.name}</h3>
                <div className="flex justify-between items-end">
                  <span className="text-indigo-600 font-black">Rs.{product.price}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${product.qty < 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                    Stock: {product.qty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-[400px] bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden sticky top-8 h-[calc(100vh-64px)]">
          <div className="p-8 border-b border-slate-50">
            <h2 className="flex items-center gap-3 font-black uppercase italic tracking-tighter text-xl">
              <ShoppingCart className="text-indigo-600" /> Current Cart
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="flex-1">
                  <p className="font-black text-xs uppercase truncate">{item.name}</p>
                  <p className="text-indigo-600 font-bold text-xs">Rs.{item.price}</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                  <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Minus size={14}/></button>
                  <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="text-rose-400 hover:text-rose-600"><X size={18}/></button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 mt-20">
                <Receipt size={64} />
                <p className="font-black uppercase text-xs mt-4">Cart Empty</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-900 text-white rounded-t-[3rem]">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-slate-400 font-bold text-xs uppercase"><span>Subtotal</span><span>Rs.{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-400 font-bold text-xs uppercase"><span>Discount</span><span>-Rs.{discountTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-2xl font-black italic border-t border-white/10 pt-4 mt-2">
                <span>TOTAL</span><span className="text-indigo-400">Rs.{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20"
            >
              Print & Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBill;
