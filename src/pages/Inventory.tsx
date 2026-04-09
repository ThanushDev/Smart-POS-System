import React, { useState, useEffect } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Plus, Search, Image as ImageIcon, X, Edit2, Trash2 } from 'lucide-react';
    import Sidebar from '../components/Sidebar';
    import { toast } from 'react-toastify';

    const Inventory = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingProduct, setEditingProduct] = useState<any>(null);
      const [search, setSearch] = useState('');
      const [productImage, setProductImage] = useState<string>('');
      const [products, setProducts] = useState<any[]>([]);

      useEffect(() => {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        } else {
          const initial = [
            { id: '1', name: 'Organic Coffee Beans', code: 'PRD-001', qty: 45, price: 7500.00, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=cover' },
            { id: '2', name: 'Almond Milk 1L', code: 'PRD-042', qty: 12, price: 1350.00, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=cover' },
          ];
          setProducts(initial);
          localStorage.setItem('products', JSON.stringify(initial));
        }
      }, []);

      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProductImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const productData = {
          id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
          name: formData.get('name') as string,
          code: editingProduct ? editingProduct.code : `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
          qty: Number(formData.get('qty')),
          price: Number(formData.get('price')),
          image: productImage || (editingProduct ? editingProduct.image : 'https://placehold.co/400x400')
        };

        let updatedProducts;
        if (editingProduct) {
          updatedProducts = products.map(p => p.id === editingProduct.id ? productData : p);
          toast.success("Product updated successfully!");
        } else {
          updatedProducts = [productData, ...products];
          toast.success("Product added successfully!");
        }

        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        closeModal();
      };

      const openEditModal = (product: any) => {
        setEditingProduct(product);
        setProductImage(product.image);
        setIsModalOpen(true);
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setProductImage('');
      };

      const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.code.toLowerCase().includes(search.toLowerCase())
      );

      return (
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">Inventory Management</h1>
                <p className="text-slate-500">Manage your stock and product catalog.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Code</th>
                    <th className="px-6 py-4 font-semibold">Stock Level</th>
                    <th className="px-6 py-4 font-semibold">Unit Price</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                          <span className="font-medium text-slate-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">{product.code}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${product.qty < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, product.qty)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{product.qty}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">Rs. {product.price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                      <div className="flex justify-center">
                        <label className="relative cursor-pointer group">
                          <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all overflow-hidden">
                            {productImage ? (
                              <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-xs font-medium">Upload Image</span>
                              </>
                            )}
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                        <input 
                          name="name" 
                          defaultValue={editingProduct?.name}
                          required 
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                          <input 
                            name="qty" 
                            type="number" 
                            defaultValue={editingProduct?.qty}
                            required 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Price per Item (Rs.)</label>
                          <input 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            defaultValue={editingProduct?.price}
                            required 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                          {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      );
    };

    export default Inventory;
