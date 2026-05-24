import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Package, X, Printer, Edit3, Hash, Search, Trash2, Tag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: '', qty: '', discount: '' });

  const formRef = useRef<HTMLFormElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const API_URL = "/api/products";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const inputs = Array.from(formRef.current?.querySelectorAll('input') || []);
      const index = inputs.indexOf(document.activeElement as HTMLInputElement);
      if (e.key === 'ArrowDown' && index < inputs.length - 1) (inputs[index + 1] as HTMLElement).focus();
      if (e.key === 'ArrowUp' && index > 0) (inputs[index - 1] as HTMLElement).focus();
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}?businessId=${user.businessId}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { toast.error("Fetch failed"); }
  };

  useEffect(() => { if (user.businessId) fetchProducts(); }, [user.businessId]);

  const triggerPrint = (product: any) => {
    const businessName = user.name || "DIGI SOLUTIONS";
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { size: 50mm 25mm; margin: 0; }
            body { margin: 0; padding: 0; width: 50mm; height: 25mm; overflow: hidden; font-family: sans-serif; }
            .sticker { width: 50mm; height: 25mm; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; box-sizing: border-box; }
            .biz { font-size: 8px; font-weight: 800; text-transform: uppercase; }
            .item { font-size: 7px; margin-bottom: 0.5mm; width: 100%; overflow: hidden; white-space: nowrap; }
            #barcode { height: 10mm; }
            .price { font-weight: 900; border-top: 1px dashed #000; font-size: 12px; width: 100%; margin-top: 0.5mm; }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="biz">${businessName}</div>
            <div class="item">${product.name}</div>
            <svg id="barcode"></svg>
            <div class="price">Rs.${(Number(product?.price) || 0).toLocaleString()}</div>
          </div>
          <script>
            JsBarcode("#barcode", "${product.code}", { format: "CODE128", width: 1.1, height: 30, displayValue: true, fontSize: 10, margin: 0 });
            setTimeout(() => { window.print(); window.close(); }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      toast.success("Inventory Updated!");
    } catch (err) { toast.error("Error saving!"); }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="flex h-screen bg-slate-50 italic font-sans">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">
            Stock <span className="text-indigo-600">Inventory</span>
          </h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-3 rounded-2xl bg-white border outline-none font-bold text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => openModal()} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-xs whitespace-nowrap">
              + Add
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border group hover:shadow-xl transition-all relative overflow-hidden">
              {p.discount > 0 && (
                <div className="absolute top-3 right-[-30px] md:top-4 md:right-[-35px] bg-emerald-500 text-white text-[9px] font-black py-0.5 px-8 md:px-10 rotate-45 shadow-sm uppercase tracking-tighter">
                  {p.discount}% OFF
                </div>
              )}

              <div className="flex justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-indigo-50 rounded-xl md:rounded-2xl text-indigo-600">
                  <Package size={18} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => triggerPrint(p)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Printer size={15}/></button>
                  <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-amber-500"><Edit3 size={15}/></button>
                  <button onClick={() => {if(window.confirm("Delete?")) axios.delete(`${API_URL}/${p._id}`).then(fetchProducts)}} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={15}/></button>
                </div>
              </div>
              <h3 className="font-black uppercase text-xs md:text-sm truncate pr-6">{p.name}</h3>
              <p className="text-[9px] md:text-[10px] text-slate-300 font-bold mt-1 tracking-widest">{p.code}</p>
              <div className="mt-4 md:mt-6 flex justify-between items-end border-t pt-3 md:pt-4 border-slate-50">
                <div>
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Price</p>
                  <p className="text-indigo-600 font-black text-base md:text-lg">
                    Rs.{(Number(p?.price) || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">Stock</p>
                  <p className="text-xs font-black text-slate-400">{p.qty} PCS</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-10 relative shadow-2xl max-h-[95vh] overflow-y-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-300 p-2"><X size={22}/></button>
              <h2 className="text-xl md:text-2xl font-black uppercase mb-6 md:mb-8 italic text-indigo-600">Product Entry</h2>
              
              <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 ml-4 mb-1">Item Name</label>
                  <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Fresh Milk" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-4 mb-1">Unit Price</label>
                    <input type="number" className={`w-full p-4 bg-slate-50 rounded-2xl border font-bold ${noArrowsClass}`} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 ml-4 mb-1">Quantity</label>
                    <input type="number" className={`w-full p-4 bg-slate-50 rounded-2xl border font-bold ${noArrowsClass}`} value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} placeholder="0" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 ml-4 mb-1">Discount (%)</label>
                  <input type="number" className={`w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 font-bold ${noArrowsClass}`} value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} placeholder="0" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase mt-4 shadow-xl">Save Item</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
