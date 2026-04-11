import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2, Search, X, Tag, Package, DollarSign, Hash } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const Inventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // දත්ත ලබා ගැනීම
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
    socket.on('update-sync', fetchProducts);
    return () => { socket.off('update-sync'); };
  }, []);

  // Product එකක් Save කිරීම (Add or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData = {
      name: formData.get('name'),
      code: formData.get('code'),
      price: Number(formData.get('price')),
      qty: Number(formData.get('qty')),
      discount: Number(formData.get('discount') || 0), // භාණ්ඩයට අදාළ Discount එක
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success("Product updated successfully");
      } else {
        await axios.post('/api/products', productData);
        toast.success("Product added successfully");
      }
      socket.emit('update-data');
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  // Product එකක් Delete කිරීම
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        socket.emit('update-data');
        toast.success("Product deleted");
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 italic uppercase">Inventory</h1>
            <p className="text-slate-400 text-sm font-bold">Manage your stock and discounts</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase text-xs tracking-widest"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              className="w-full bg-slate-50 pl-12 pr-4 py-3 rounded-xl outline-none font-bold text-slate-600 border border-transparent focus:border-indigo-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-6 px-6 border-l border-slate-100">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Items</p>
                <p className="text-lg font-black text-indigo-600">{products.length}</p>
             </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm flex-1 overflow-hidden flex flex-col border border-slate-100">
          <div className="overflow-y-auto flex-1 p-4">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-6 py-2">Product Details</th>
                  <th className="px-6 py-2">Code</th>
                  <th className="px-6 py-2">Stock</th>
                  <th className="px-6 py-2">Price (Rs.)</th>
                  <th className="px-6 py-2">Disc %</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <td className="px-6 py-4 rounded-l-[1.5rem]">
                      <p className="font-black text-slate-700 uppercase text-sm">{product.name}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">{product.code}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${product.qty < 10 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {product.qty} IN STOCK
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700">Rs. {product.price}</td>
                    <td className="px-6 py-4">
                      <span className="font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 text-xs">
                        {product.discount || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-[1.5rem] text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                          className="p-2 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black uppercase text-slate-800 italic">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Product Name</label>
                    <div className="flex items-center bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:border-indigo-500 transition-all">
                      <Package className="text-slate-400 mr-3" size={20} />
                      <input name="name" type="text" placeholder="Enter Product Name" defaultValue={editingProduct?.name} required className="bg-transparent w-full outline-none font-bold uppercase" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Product Code</label>
                    <div className="flex items-center bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:border-indigo-500 transition-all">
                      <Hash className="text-slate-400 mr-3" size={20} />
                      <input name="code" type="text" placeholder="e.g. PRD001" defaultValue={editingProduct?.code} required className="bg-transparent w-full outline-none font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Qty</label>
                      <input name="qty" type="number" placeholder="0" defaultValue={editingProduct?.qty} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Price (Rs)</label>
                      <input name="price" type="number" placeholder="0.00" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-orange-500 ml-2 block">Disc %</label>
                      <input name="discount" type="number" placeholder="0%" defaultValue={editingProduct?.discount} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-orange-500 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 px-8"
                  >
                    {loading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
