import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, ShoppingCart, Trash2, Printer, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadData = async () => {
      const res = await axios.get(`/api/products?businessId=${user.businessId}`);
      setProducts(res.data);
    };
    loadData();
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, cartQty: item.cartQty + 1 } : item));
    } else {
      setCart([...cart, { ...product, cartQty: 1 }]);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.cartQty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const invoiceData = {
        invoiceId: "INV-" + Date.now().toString().slice(-6),
        items: cart,
        total: total,
        cashier: user.name,
        date: new Date().toISOString().split('T')[0],
        businessId: user.businessId
      };
      await axios.post('/api/invoices', invoiceData);
      toast.success("Bill Generated!");
      setCart([]);
      // Tip: Meke printer function ekak danna puluwan passe
    } catch (err) { toast.error("Checkout Failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-8">
        <div className="flex-1 flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"/>
            <input type="text" placeholder="Scan or Type Product Name..." className="w-full p-5 pl-14 bg-white rounded-[2rem] shadow-sm outline-none font-bold border border-slate-100" onChange={e => setSearch(e.target.value)}/>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
              <button key={p._id} onClick={() => addToCart(p)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-left hover:border-indigo-500 hover:shadow-xl transition-all group">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{p.code}</p>
                <p className="font-black text-slate-800 uppercase text-sm mb-3 group-hover:text-indigo-600">{p.name}</p>
                <p className="text-lg font-black text-slate-900">Rs. {p.price.toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="w-[400px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 bg-indigo-600 text-white">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3"><ShoppingCart/> Current Bill</h2>
          </div>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <div>
                  <p className="font-black text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.cartQty} x {item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-sm">{(item.price * item.cartQty).toLocaleString()}</p>
                  <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-slate-100 space-y-4">
            <div className="flex justify-between text-2xl font-black italic uppercase">
              <span>Total</span>
              <span className="text-indigo-600">Rs. {total.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <CheckCircle size={20}/> Complete Bill
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default NewBill;
