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

  useEffect(() => {
    fetchData();
    searchInputRef.current?.focus();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/products');
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
        if (existing.quantity >= product.qty) return currentCart;
        return currentCart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        const original = products.find(p => p._id === id);
        if (newQty > 0 && newQty <= original.qty) return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item._id !== id));

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + ((item.price * (item.discount || 0) / 100) * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      await axios.post('/api/invoices', {
        invoiceId: `INV-${Date.now()}`,
        items: cart,
        total: finalTotal,
        discountTotal: discountTotal,
        cashier: user.name || "Staff",
        date: new Date()
      });
      toast.success("Bill Completed!");
      setCart([]);
      fetchData();
    } catch (err) { toast.error("Checkout Failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm flex items-center gap-4 border border-slate-200">
            <Search className="text-slate-400" size={20} />
            <input ref={searchInputRef} type="text" placeholder="Scan Barcode or Type Code..." className="flex-1 outline-none font-bold" value={searchTerm} onChange={handleSearchChange} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm)).map(p => (
              <div key={p._id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-[2rem] border border-slate-100 hover:border-indigo-400 cursor-pointer shadow-sm relative group">
                
                {/* DISCOUNT TAG: තිබුණොත් විතරක් පෙන්වන්න */}
                {p.discount > 0 && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">
                    {p.discount}% OFF
                  </div>
                )}

                <h4 className="font-black text-xs uppercase truncate mb-1 pr-10">{p.name}</h4>
                <p className="text-[9px] text-slate-400 font-bold mb-3">#{p.code}</p>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-indigo-600 font-black italic text-sm">
                      Rs.{ (p.price - (p.price * p.discount / 100)).toFixed(2) }
                    </span>
                    {/* පරණ මිල පෙන්වන්නේ discount එකක් තිබේ නම් පමණි */}
                    {p.discount > 0 && (
                      <span className="text-[9px] text-slate-300 line-through font-bold">
                        Rs.{p.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${p.qty < 5 ? 'text-rose-500' : 'text-slate-400'}`}>Stock: {p.qty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Current Cart</h2>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl"><ShoppingCart size={22} /></div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-black text-[11px] uppercase truncate">{item.name}</h5>
                  <p className="text-[10px] font-bold text-indigo-600">Rs.{(item.price - (item.price * item.discount / 100)).toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                  <button onClick={() => updateQty(item._id, -1)} className="p-1"><Minus size={12}/></button>
                  <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, 1)} className="p-1"><Plus size={12}/></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="ml-2 text-rose-500"><Trash2 size={16}/></button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Receipt size={40} strokeWidth={1.5} />
                <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Cart is Empty</p>
              </div>
            )}
          </div>
          <div className="p-8 bg-slate-50/50">
            <div className="space-y-2 mb-6 font-bold text-xs uppercase italic">
              <div className="flex justify-between text-slate-400 tracking-tighter"><span>Subtotal</span><span>Rs.{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-500 tracking-tighter"><span>Total Savings</span><span>- Rs.{discountTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-black text-slate-800 border-t border-slate-200 pt-3 mt-2"><span>Net Total</span><span className="text-indigo-600">Rs.{finalTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95">Complete Bill</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBill;
