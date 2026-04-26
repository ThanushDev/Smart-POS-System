import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/products?businessId=' + user.businessId);
      setProducts(res.data);
    };
    fetchData();
  }, []);

  const addToCart = (product: any) => {
    if (product.qty <= 0) return toast.error("Out of stock!");
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + ((item.price * (item.discount || 0) / 100) * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post('/api/invoices', {
        invoiceId: `INV-${Date.now()}`,
        items: cart,
        total: finalTotal,
        discountTotal: discountTotal,
        cashier: user.name,
        businessId: user.businessId,
        date: new Date()
      });
      toast.success("Bill Completed!");
      setCart([]);
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        <div className="flex-[1.5] flex flex-col">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm flex items-center gap-4 mb-6">
            <Search className="text-slate-300" />
            <input type="text" placeholder="Scan or Search Product..." className="flex-1 outline-none font-bold italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p._id} onClick={() => addToCart(p)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 hover:border-indigo-400 cursor-pointer shadow-sm relative group transition-all">
                {p.discount > 0 && <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">{p.discount}% OFF</div>}
                <h4 className="font-black text-xs uppercase truncate text-slate-800">{p.name}</h4>
                <p className="text-[10px] text-indigo-600 font-black italic mt-2">Rs.{(p.price - (p.price * p.discount / 100)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col border border-slate-50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Current Cart</h2>
            <ShoppingCart className="text-indigo-600" />
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                <div className="flex-1">
                  <h5 className="font-black text-[10px] uppercase truncate">{item.name}</h5>
                  <p className="text-[10px] font-bold text-indigo-600">Rs.{item.price} x {item.quantity}</p>
                </div>
                <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} className="text-rose-500 ml-4"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
          <div className="p-8 bg-slate-50/50 space-y-2">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400"><span>Savings</span><span>Rs.{discountTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-xl uppercase italic text-indigo-600 border-t border-slate-100 pt-4"><span>Total</span><span>Rs.{finalTotal.toFixed(2)}</span></div>
            <button onClick={handleCheckout} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase mt-4 shadow-lg hover:bg-indigo-700 transition-all">Complete Bill</button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default NewBill;
