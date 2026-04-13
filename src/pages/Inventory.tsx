import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Trash2, Package, X, Percent, Printer, Barcode as BarcodeIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Barcode from 'react-barcode';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: 0, qty: 0, discount: 0 });

  const printRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // PRINT LOGIC
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  const triggerBarcodePrint = (product: any) => {
    setSelectedProductForPrint(product);
    setTimeout(() => { handlePrint(); }, 500);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, code: product.code, price: product.price, qty: product.qty, discount: product.discount || 0 });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { headers: { 'user-role': user.role } };
    try {
      if (editingProduct) {
        if (!isAdmin) return toast.error("Admin Only!");
        await axios.put(`/api/products/${editingProduct._id}`, formData, config);
        toast.success("Updated!");
      } else {
        await axios.post('/api/products', formData, config);
        toast.success("Added Successfully!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error("Error!"); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Delete this product?")) {
      await axios.delete(`/api/products/${id}`, { headers: { 'user-role': user.role } });
      fetchProducts();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Stock Manager</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory & Barcodes</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search code/name..." className="pl-10 pr-4 py-2.5 bg-white rounded-xl outline-none shadow-sm font-bold w-64 border border-transparent focus:border-indigo-100" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all">
              <Plus size={18}/> Add Item
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-10">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group relative">
              
              {/* DISCOUNT TAG */}
              {p.discount > 0 && (
                <div className="absolute top-0 right-10 bg-emerald-500 text-white px-3 py-1 rounded-b-xl font-black text-[9px] uppercase">
                  {p.discount}% OFF
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-1">
                   {/* BARCODE PRINT BUTTON */}
                   <button onClick={() => triggerBarcodePrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg title='Print Sticker'"><Printer size={18}/></button>
                   {isAdmin && (
                    <>
                      <button onClick={() => openModal(p)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="font-black uppercase text-sm mb-1 truncate">{p.name}</h3>
              
              {/* VISUAL BARCODE ON CARD */}
              <div className="my-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <Barcode value={p.code || "000"} width={1} height={30} fontSize={10} background="transparent" />
              </div>

              <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-2">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Final Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs.{(p.price - (p.price * p.discount / 100)).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase">Stock</p>
                  <p className={`text-lg font-black ${p.qty < 5 ? 'text-rose-500 animate-pulse' : 'text-slate-800'}`}>{p.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* HIDDEN PRINT COMPONENT */}
      <div className="hidden">
        <div ref={printRef}>
           <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
            <h2 className="text-2xl font-black uppercase italic mb-8">{editingProduct ? 'Edit' : 'Add'} <span className="text-indigo-600">Product</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Barcode / Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Price (Rs)</label>
                  <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Quantity</label>
                  <input type="number" step="any" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: parseFloat(e.target.value) || 0})} required />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <Percent size={14} className="text-emerald-600" />
                  <label className="text-[10px] font-black text-emerald-600 uppercase">Discount (%)</label>
                </div>
                <input type="number" step="any" className="w-full bg-transparent outline-none font-black text-emerald-700 text-xl" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} />
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-indigo-100">
                {editingProduct ? 'Update Product' : 'Save to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
