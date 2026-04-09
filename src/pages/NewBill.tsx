import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, Printer, ShoppingCart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { toast } from 'react-toastify';

const NewBill = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>({ name: 'Smart POS', logo: '' });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    
    const savedInfo = localStorage.getItem('businessInfo');
    if (savedInfo) setBusinessInfo(JSON.parse(savedInfo));
  }, []);

  // BARCODE SCANNER LOGIC
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // වේගයෙන් ටයිප් වීමක් (Scanner එකක්) ලෙස හඳුනා ගැනීමට (100ms ට වඩා අඩු කාලයක් ඇතුළත)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 2) {
          const product = products.find(p => p.code.toLowerCase() === barcodeBuffer.toLowerCase());
          if (product) {
            addToCart(product);
            toast.success(`Scanned: ${product.name}`);
          } else {
            toast.error("Product not found!");
          }
          barcodeBuffer = '';
        }
      } else if (e.key !== 'Shift') {
        barcodeBuffer += e.key;
      }
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePrint = () => {
    if (cart.length === 0) return;
    const invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      items: cart,
      total,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify([invoice, ...savedInvoices]));
    
    setTimeout(() => {
      window.print();
      setCart([]);
      toast.success("Bill Saved and Printing...");
    }, 300);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold text-slate-900">New Bill</h1>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Scan or search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())).map((product) => (
              <motion.div key={product.id} whileTap={{ scale: 0.95 }} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-500 transition-colors group">
                <img src={product.image || 'https://placehold.co/100x100'} className="w-full h-32 object-cover rounded-xl mb-3" alt="" />
                <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                <p className="text-slate-500 text-sm mb-2">{product.code}</p>
                <p className="text-indigo-600 font-bold">Rs. {product.price.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg flex flex-col h-[calc(100vh-4rem)]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <ShoppingCart className="text-indigo-600" />
            <h2 className="text-xl font-bold">Current Cart</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500">Rs. {item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded text-indigo-600"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded text-indigo-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <button onClick={handlePrint} disabled={cart.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100">
              <Printer size={20} /> Print & Save
            </button>
          </div>
        </div>
      </main>

      <PrintableBill ref={printRef} invoiceNumber={`INV-${Date.now().toString().slice(-6)}`} items={cart} total={total} businessName={businessInfo.name} businessLogo={businessInfo.logo} businessMobile="{businessInfo.mobile} />
    </div>
  );
};

export default NewBill;
