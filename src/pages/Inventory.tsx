import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Trash2, Package, X, Printer } from 'lucide-react';
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
      const res = await axios.get('/api/products?businessId=' + user.businessId);
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null)
  });

  useEffect(() => { if (selectedProductForPrint) handlePrint(); }, [selectedProductForPrint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, businessId: user.businessId };
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      setShowModal(false);
      fetchProducts();
      toast.success("Done!");
    } catch (err) { toast.error("Error!"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Inventory</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2.5 bg-white rounded-xl outline-none shadow-sm font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
              <Plus size={18}/> Add Item
            </button>
          </div>
        </header>

        {/* Card View - Meka thamai oyaage parana lassanama interface eka */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
            <div key={p._id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group relative hover:shadow-xl transition-all">
              {p.discount > 0 && <div className="absolute top-0 right-10 bg-emerald-500 text-white px-3 py-1 rounded-b-xl font-black text-[9px]">{p.discount}% OFF</div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600"><Package size={24} /></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setSelectedProductForPrint(p)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Printer size={18}/></button>
                   <button onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 size={18}/></button>
                </div>
              </div>

              <h3 className="font-black uppercase text-sm mb-1 truncate text-slate-800 italic">{p.name}</h3>
              <div className="my-3 flex justify-center bg-slate-50 py-2 rounded-xl">
                <Barcode value={p.code || "000"} width={1} height={30} fontSize={10} background="transparent" />
              </div>

              <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-2">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">Price</p>
                  <p className="text-xl font-black text-indigo-600 italic">Rs.{p.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">Stock</p>
                  <p className={`text-lg font-black ${p.qty < 5 ? 'text-rose-500' : 'text-slate-800'}`}>{p.qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="hidden"><div ref={printRef}>{selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName="DIGI SOLUTIONS" />}</div></div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
            <h2 className="text-xl font-black italic uppercase mb-6">{editingProduct ? 'Edit' : 'Add'} Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Barcode Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                <input type="number" placeholder="Qty" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg transition-all hover:bg-indigo-700">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inventory;
