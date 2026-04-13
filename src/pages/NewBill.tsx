import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, User, Smartphone, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [business, setBusiness] = useState<any>(null);

  // Barcode Scanner එකෙන් scan කරන කොට focus වෙන්න ඕන input එකට ref එකක්
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    // පිටුව load වුණු ගමන් search box එකට focus කරනවා (Scanner එකට ලේසි වෙන්න)
    searchInputRef.current?.focus();
  }, []);

  const fetchData = async () => {
    const [pRes, bRes] = await Promise.all([
      axios.get('/api/products'),
      axios.get('/api/business')
    ]);
    setProducts(pRes.data);
    setBusiness(bRes.data);
  };

  // --- BARCODE / SEARCH LOGIC ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Scan කළොත් හෝ හරියටම Code එක ටයිප් කළොත් Auto Add වෙන ලොජික් එක
    const foundProduct = products.find(p => p.code === value);
    
    if (foundProduct) {
      addToCart(foundProduct);
      setSearchTerm(''); // එකතු වුණාට පස්සේ search box එක clear කරනවා ඊළඟ scan එකට
    }
  };

  const addToCart = (product: any) => {
    if (product.qty <= 0) return toast.error("Out of stock!");
    
    setCart(currentCart => {
      const existing = currentCart.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.qty) {
          toast.warn("Stock limit reached");
          return currentCart;
        }
        return currentCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        const originalProduct = products.find(p => p._id === id);
        if (newQty > 0 && newQty <= originalProduct.qty) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  // කැල්කියුලේෂන් (Decimal Support එකත් එක්ක)
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((sum, item) => sum + ((item.price * (item.discount || 0) / 100) * item.quantity), 0);
  const finalTotal = subTotal - discountTotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const invoiceData = {
      invoiceId: `INV-${Date.now()}`,
      items: cart,
      total: finalTotal,
      discountTotal: discountTotal,
      cashier: user.name || "Staff",
      customerName: customer.name,
      customerPhone: customer.phone,
      date: new Date()
    };

    try {
      await axios.post('/api/invoices', invoiceData);
      toast.success("Invoice Saved Successfully!");
      setCart([]);
      setCustomer({ name: '', phone: '' });
      fetchData(); // Stock update එක බලාගන්න
    } catch (err) {
      toast.error("Checkout Failed");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-6 flex gap-6 overflow-hidden">
        
        {/* වම් පැත්ත: Product Search & List */}
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm flex items-center gap-4 border border-slate-200">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Search size={20} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Scan Barcode or Type Product Code/Name..."
              className="flex-1 outline-none font-bold text-slate-700"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && <button onClick={() => setSearchTerm('')}><X size={18} className="text-slate-400" /></button>}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm))
              .map(p => (
                <div 
                  key={p._id} 
                  onClick={() => addToCart(p)}
                  className="bg-white p-4 rounded-[2rem] border border-slate-100 hover:border-indigo-400 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Plus size={20} />
                    </div>
                    {p.discount > 0 && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">{p.discount}% OFF</span>}
                  </div>
                  <h4 className="font-black text-xs uppercase truncate">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mb-2">CODE: {p.code}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 font-black italic">Rs.{(p.price - (p.price * p.discount / 100)).toFixed(2)}</span>
                    <span className={`text-[10px] font-bold ${p.qty < 5 ? 'text-rose-500' : 'text-slate-400'}`}>Qty: {p.qty}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* දකුණු පැත්ත: Cart & Checkout */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Current Bill</h2>
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><ShoppingCart size={24} /></div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <User size={18} className="text-slate-400" />
                <input type="text" placeholder="Customer Name" className="bg-transparent outline-none text-xs font-bold w-full" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <Smartphone size={18} className="text-slate-400" />
                <input type="text" placeholder="Phone Number" className="bg-transparent outline-none text-xs font-bold w-full" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex items-center justify-between group">
                <div className="flex-1">
                  <h5 className="font-black text-[11px] uppercase truncate">{item.name}</h5>
                  <p className="text-[10px] font-bold text-indigo-600">Rs.{item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
                  <button onClick={() => updateQty(item._id, -1)} className="p-1 hover:bg-white rounded-lg shadow-sm"><Minus size={14}/></button>
                  <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, 1)} className="p-1 hover:bg-white rounded-lg shadow-sm"><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item._id)} className="ml-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Receipt size={48} strokeWidth={1} />
                <p className="text-xs font-bold mt-2 uppercase">Cart is Empty</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold text-slate-400 italic">
                <span>SUBTOTAL</span>
                <span>Rs.{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-500 italic">
                <span>TOTAL SAVINGS</span>
                <span>- Rs.{discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-200 uppercase italic tracking-tighter">
                <span>Net Total</span>
                <span className="text-indigo-600">Rs.{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-[2rem] font-black uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Complete Checkout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewBill;
