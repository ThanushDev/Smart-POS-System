import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Edit3, Trash2, Package, X, Percent, Printer } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProductForPrint, setSelectedProductForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '', price: 0, qty: 0, discount: 0 });

  const printRef = useRef<HTMLDivElement>(null);
  
  // LocalStorage එකෙන් current user ව ගන්නවා
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';
  
  // Data isolation සඳහා පාවිච්චි කරන ID එක
  // Admin කෙනෙක් නම් එයාගේ _id එක, Staff කෙනෙක් නම් එයා අයිති businessId එක
  const businessId = user.role === 'Admin' ? user._id : user.businessId;

  // 1. Fetch Products (Filtered by Business ID)
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', {
        headers: { 'business-id': businessId } // Header එකෙන් ID එක යවනවා
      });
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => {
    if (businessId) fetchProducts();
  }, [businessId]);

  // 2. Add or Update Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Data වලට businessId එක ඇතුළත් කරනවා
      const productData = { ...formData, businessId: businessId };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success("Product Updated");
      } else {
        await axios.post('/api/products/add', productData);
        toast.success("Product Added");
      }
      
      setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 });
      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  // 3. Delete Product
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { 'user-role': user.role }
      });
      toast.success("Product Deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setSelectedProductForPrint(null),
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Inventory <span className="text-indigo-600">Stock</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage your retail products</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm outline-none font-bold text-sm focus:ring-2 ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => { setEditingProduct(null); setFormData({ name: '', code: '', price: 0, qty: 0, discount: 0 }); setShowModal(true); }}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Plus size={18} /> Add Product
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Barcode</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase italic tracking-tighter">{product.name}</p>
                        {product.discount > 0 && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">-{product.discount}% OFF</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs font-bold text-slate-400">{product.code}</td>
                  <td className="px-6 py-5 font-black text-slate-800">Rs. {product.price.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-2 rounded-xl font-black text-xs ${product.qty <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                      {product.qty} Units
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setSelectedProductForPrint(product); setTimeout(handlePrint, 500); }} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"><Printer size={16}/></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-amber-500 hover:border-amber-100 transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => handleDelete(product._id)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"><Trash2 size={16}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-all"><X size={24}/></button>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">{editingProduct ? 'Edit' : 'Add'} <span className="text-indigo-600">Product</span></h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Product Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <input type="text" placeholder="Barcode Code" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Price" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} required />
                  <input type="number" placeholder="Qty" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.qty} onChange={(e) => setFormData({...formData, qty: Number(e.target.value)})} required />
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <label className="text-[10px] font-black text-emerald-600 uppercase">Discount %</label>
                  <input type="number" className="w-full bg-transparent outline-none font-black text-emerald-700 text-xl" value={formData.discount} onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})} />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="hidden">
          <div ref={printRef}>
            {selectedProductForPrint && <PrintableBarcode product={selectedProductForPrint} businessName={user.name} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
