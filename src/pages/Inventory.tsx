import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Image as ImageIcon, X, Edit2, Trash2, Barcode } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [productImage, setProductImage] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedForBarcode, setSelectedForBarcode] = useState<any>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      qty: Number(formData.get('qty')),
      price: Number(formData.get('price')),
      image: productImage || (editingProduct ? editingProduct.image : '')
    };

    const newProducts = editingProduct 
      ? products.map(p => p.id === editingProduct.id ? productData : p)
      : [...products, productData];

    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
    toast.success(editingProduct ? "Product updated!" : "Product added!");
    closeModal();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure?")) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      localStorage.setItem('products', JSON.stringify(newProducts));
      toast.info("Product removed.");
    }
  };

  const handlePrintBarcode = (product: any) => {
    setSelectedForBarcode(product);
    setTimeout(() => {
      window.print();
      setSelectedForBarcode(null);
    }, 500);
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Inventory</h1>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
            <Plus size={20} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())).map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={product.image || 'https://placehold.co/40x40'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <span className="font-medium">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{product.code}</td>
                  <td className="px-6 py-4 font-bold">{product.qty}</td>
                  <td className="px-6 py-4 text-slate-600">Rs. {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handlePrintBarcode(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Print Barcode"><Barcode size={18} /></button>
                      <button onClick={() => openEditModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between">
                  <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  <button onClick={closeModal}><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                  <div className="flex justify-center">
                    <label className="relative cursor-pointer group">
                      <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 overflow-hidden">
                        {productImage ? <img src={productImage} className="w-full h-full object-cover" alt="" /> : <><ImageIcon size={32} /> <span className="text-xs">Upload</span></>}
                      </div>
                      <input type="file" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <input name="code" placeholder="Barcode / Product Code" defaultValue={editingProduct?.code} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="qty" type="number" placeholder="Quantity" defaultValue={editingProduct?.qty} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Product</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      {selectedForBarcode && <PrintableBarcode ref={barcodeRef} product={selectedForBarcode} />}
    </div>
  );
};

export default Inventory;
