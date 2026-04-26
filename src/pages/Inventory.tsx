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

  // FIXED: Content eka render wela barcode script eka run wenna kalla delay eka 1.5s kala
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Wait until barcode SVG is likely rendered
        setTimeout(() => resolve(), 1500); 
      });
    },
    onAfterPrint: () => {
      setSelectedProductForPrint(null);
    }
  });

  const triggerPrint = (product: any) => {
    setSelectedProductForPrint(product);
    // Give react time to mount the PrintableBarcode component before calling handlePrint
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        code: product.code, 
        price: product.price.toString(), 
        qty: product.qty.toString(), 
        discount: (product.discount || 0).toString() 
      });
    } else {
      setEditingProduct(null);
      const autoSKU = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
      setFormData({ name: '', code: autoSKU, price: '', qty: '', discount: '0' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      price: parseFloat(formData.price), 
      qty: parseFloat(formData.qty), 
      discount: parseFloat(formData.discount) || 0, 
      businessId: user.businessId 
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/${editingProduct._id}`, payload);
        toast.success("Product Updated!");
      } else {
        await axios.post(API_URL, payload);
        toast.success("Product Added!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Error saving product");
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Deleted!");
        fetchProducts();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 italic font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Stock <span className="text-indigo-600">Inventory</span></h1>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Manage your products & labels</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 outline-none focus:ring-2 ring-indigo-100 font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-100 hover:scale-105 transition-transform">
              + Add Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative">
              {p.discount > 0 && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                  {p.discount}% OFF
                </div>
              )}
              
              <div className="flex justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Package size={22}/></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => triggerPrint(p)} className="p-2 text-slate-400 hover:text-indigo-600" title="Print Barcode"><Printer size={18}/></button>
                  <button onClick={() => openModal(p)} className="p-2 text-slate-400 hover:text-amber-500" title="Edit"><Edit3 size={18}/></button>
                  <button onClick={() => deleteProduct(p._id)} className="p-2 text-slate-400 hover:text-rose-500" title="Delete"><Trash2 size={18}/></button>
                </div>
              </div>

              <h3 className="font-black uppercase text-sm truncate">{p.name}</h3>
              <p className="text-[10px] text-slate-300 font-bold tracking-widest mt-1">{p.code}</p>

              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
                  <p className="text-indigo-600 font-black text-lg">
                    Rs.{(p.price - (p.price * (p.discount || 0) / 100)).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Stock</p>
                  <span className={`text-sm font-black ${p.qty < 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                    {p.qty} <span className="text-[10px]">PCS</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HIDDEN PRINT CONTAINER - Keep off-screen */}
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <div ref={printRef}>
            {selectedProductForPrint && (
              <PrintableBarcode 
                product={selectedProductForPrint} 
                businessName={user.name || "DIGI SOLUTIONS"} 
              />
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 relative shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors">
                <X size={24}/>
              </button>
              
              <h2 className="text-2xl font-black uppercase mb-8 italic">
                {editingProduct ? 'Edit' : 'New'} <span className="text-indigo-600">Product</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1 mb-1">
                    <Hash size={10}/> System SKU Code
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent font-black text-sm outline-none text-indigo-500" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    placeholder="Price" 
                    required 
                  />
                  <input 
                    type="number" 
                    className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" 
                    value={formData.qty} 
                    onChange={(e) => setFormData({...formData, qty: e.target.value})} 
                    placeholder="Qty" 
                    required 
                  />
                </div>

                <input 
                  type="number" 
                  className="w-full p-4 bg-emerald-50 rounded-2xl outline-none font-bold" 
                  value={formData.discount} 
                  onChange={(e) => setFormData({...formData, discount: e.target.value})} 
                  placeholder="Discount %" 
                />

                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase shadow-xl">
                  {editingProduct ? 'Update Product' : 'Add to Inventory'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
