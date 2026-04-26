import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Package, X, Printer, Edit3, Hash, Search, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '', discount: '' });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = "/api/products";

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}?businessId=${user.businessId}`);
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (user.businessId) fetchProducts();
  }, [user.businessId]);

  // --- PRINT LOGIC ---
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 1500); // 1.5s delay for barcode script
      });
    },
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price.toString(), qty: product.qty.toString(), discount: (product.discount || 0).toString() });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: `SKU-${Math.floor(100000 + Math.random() * 900000)}`, price: '', qty: '', discount: '0' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price), qty: parseFloat(formData.qty), discount: parseFloat(formData.discount) || 0, businessId: user.businessId };
    try {
      if (editingProduct) await axios.put(`${API_URL}/${editingProduct._id}`, payload);
      else await axios.post(API_URL, payload);
      setShowModal(false);
      fetchProducts();
      toast.success("Success!");
    } catch (err) { toast.error("Error saving!"); }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
        toast.success("Deleted!");
      } catch (err) { toast.error("Failed!"); }
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 italic font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">Stock <span className="text-indigo-600">Inventory</span></h1>
          <div className="flex gap-3">
            <input type="text" placeholder="Search..." className="pl-6 pr-4 py-3 rounded-2xl bg-white border outline-none font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg">Add Item</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border group relative hover:shadow-xl transition-all">
              <div className="flex justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package size={22}/></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => triggerPrint(p)} className="p-2 text-slate-400 hover:text-indigo-600"><Printer size={18}/></button>
                  <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-amber-500"><Edit3 size={18}/></button>
                  <button onClick={() => deleteProduct(p._id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button>
                </div>
              </div>
              <h3 className="font-black uppercase text-sm truncate">{p.name}</h3>
              <p className="text-[10px] text-slate-300 font-bold mt-1 tracking-widest">{p.code}</p>
              <div className="mt-6 flex justify-between items-end border-t pt-4">
                <p className="text-indigo-600 font-black text-lg">Rs.{p.price.toLocaleString()}</p>
                <p className="text-xs font-black text-slate-400">{p.qty} PCS</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- CRITICAL: HIDDEN PRINT CONTAINER --- */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div ref={printRef}>
            {selectedProductForPrint && (
              <PrintableBarcode 
                product={selectedProductForPrint} 
                businessName={user.name || "DIGI SOLUTIONS"} 
              />
            )}
          </div>
        </div>

        {/* Modal simplified for space */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300"><X size={24}/></button>
              <h2 className="text-2xl font-black uppercase mb-8 italic">Product <span className="text-indigo-600">Details</span></h2>
              <form onSubmit={handleSubmit} className="space-y-4 font-bold">
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Product Name" required />
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="SKU Code" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="p-4 bg-slate-50 rounded-2xl outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Price" required />
                  <input type="number" className="p-4 bg-slate-50 rounded-2xl outline-none" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="Qty" required />
                </div>
                <input type="number" className="w-full p-4 bg-emerald-50 rounded-2xl outline-none" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="Discount %" />
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-lg">Save Product</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
