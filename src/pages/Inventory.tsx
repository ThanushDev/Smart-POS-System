import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Image as ImageIcon, X, Edit2, Trash2, Barcode, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { toast } from 'react-toastify';
import axios from 'axios';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [productImage, setProductImage] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForBarcode, setSelectedForBarcode] = useState<any>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Products from MongoDB
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. Save or Update Product in MongoDB
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const productData = {
      name: formData.get('name'),
      code: formData.get('code'),
      price: Number(formData.get('price')),
      qty: Number(formData.get('qty')),
      image: productImage || editingProduct?.image
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/products?id=${editingProduct._id}`, productData);
        toast.success("Product Updated!");
      } else {
        await axios.post('/api/products', productData);
        toast.success("Product Added to Inventory!");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setProductImage('');
      fetchProducts(); // Refresh List
    } catch (err) {
      toast.error("Error saving product");
    }
  };

  // 3. Delete Product from MongoDB
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete('/api/products', { data: { id } });
        toast.success("Product Removed");
        fetchProducts();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Inventory</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Manage your warehouse stock</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setProductImage(''); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 uppercase text-xs tracking-widest active:scale-95 transition-all"
          >
            <Plus size={18} /> Add Product
          </button>
        </header>

        {/* Search & Stats Area */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or barcode..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600 italic transition-all focus:ring-2 focus:ring-indigo-500/10"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 uppercase font-black text-xs gap-4">
            <Loader2 className="animate-spin" size={40} /> Loading Cloud Data...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                key={product._id} 
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
              >
                <div className="aspect-square bg-slate-50 rounded-[2rem] mb-4 overflow-hidden relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={48} /></div>
                  )}
                  {product.qty <= 5 && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg animate-pulse">Low Stock</div>
                  )}
                </div>
                <h3 className="font-black text-slate-800 uppercase italic tracking-tighter truncate">{product.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Code: {product.code}</p>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Price</p>
                    <p className="text-xl font-black text-slate-800 italic">Rs. {product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</p>
                    <p className={`text-lg font-black italic ${product.qty <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>{product.qty} PCS</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 pt-4 border-t border-slate-50">
                  <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="flex-1 py-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"><Edit2 size={16} /></button>
                  <button onClick={() => setSelectedForBarcode(product)} className="flex-1 py-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center"><Barcode size={16} /></button>
                  <button onClick={() => handleDelete(product._id)} className="flex-1 py-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for Add/Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 relative shadow-2xl">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600"><X size={24} /></button>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800 mb-2">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Fill in the product details below</p>
                
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <label className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden group">
                      {productImage || editingProduct?.image ? (
                        <img src={productImage || editingProduct?.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="text-slate-300 group-hover:text-indigo-400" size={32} />
                          <span className="text-[8px] font-black uppercase text-slate-400 mt-2">Upload Photo</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500/10" />
                  <input name="code" placeholder="Barcode / Product Code" defaultValue={editingProduct?.code} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500/10" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="qty" type="number" placeholder="Quantity" defaultValue={editingProduct?.qty} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500/10" />
                    <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500/10" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Save to Inventory</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Barcode Print Component */}
      {selectedForBarcode && <PrintableBarcode ref={barcodeRef} product={selectedForBarcode} />}
    </div>
  );
};

export default Inventory;
