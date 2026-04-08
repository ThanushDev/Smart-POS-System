import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, Printer, ShoppingCart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrintableBill from '../components/PrintableBill';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  image: string;
}

const NewBill = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const products: Product[] = [
    { id: '1', name: 'Organic Coffee', code: 'PRD-001', price: 7500.00, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=cover' },
    { id: '2', name: 'Green Tea', code: 'PRD-002', price: 3750.00, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=cover' },
    { id: '3', name: 'Honey Jar', code: 'PRD-003', price: 5400.00, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=cover' },
    { id: '4', name: 'Almond Milk', code: 'PRD-004', price: 1350.00, image: 'https://placehold.co/400x400' },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
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
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    window.print();
    toast.success("Bill generated successfully!");
    setCart([]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {/* Product Selection Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900">New Transaction</h1>
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search product name or code..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-mono text-slate-400 mb-1">{product.code}</p>
                  <h3 className="font-bold text-slate-900 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">Rs. {product.price.toLocaleString('en-LK')}</span>
                    <button className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <ShoppingCart className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Current Order</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-indigo-600 font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-slate-50 rounded text-slate-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-slate-50 rounded text-slate-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal</span>
              <span>Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Tax (0%)</span>
              <span>Rs. 0.00</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={handlePrint}
              disabled={cart.length === 0}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              <Printer size={20} />
              Submit & Print Bill
            </button>
          </div>
        </div>
      </main>

      {/* Hidden Printable Component */}
      <PrintableBill 
        ref={printRef}
        invoiceNumber={`INV-${Date.now().toString().slice(-6)}`}
        items={cart}
        total={total}
        businessName="Meku Retail Solutions"
      />
    </div>
  );
};

export default NewBill;