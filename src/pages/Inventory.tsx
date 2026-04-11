import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Edit2, Trash2, Barcode, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrintableBarcode from '../components/PrintableBarcode';
import { toast } from 'react-toastify';
import axios from 'axios';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForBarcode, setSelectedForBarcode] = useState<any>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) { toast.error("Failed to load inventory"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handlePrint = () => {
    if (barcodeRef.current) {
      const printContent = barcodeRef.current.innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0'; iframe.style.bottom = '0';
      iframe.style.width = '0'; iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.write(`<html><head><title>Print Barcode</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { @page { size: 50mm 30mm; margin: 0; } body { margin: 0; padding: 0; } }</style></head><body><div class="flex justify-center items-center h-screen">${printContent}</div><script>window.onload = function() { window.print(); setTimeout(() => { window.frameElement.remove(); }, 100); };</script></body></html>`);
        doc.close();
      }
    }
  };

  useEffect(() => {
    if (selectedForBarcode) {
      const timer = setTimeout(() => { handlePrint(); setSelectedForBarcode(null); }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedForBarcode]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = { name: formData.get('name'), code: formData.get('code'), price: Number(formData.get('price')), qty: Number(formData.get('qty')) };
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success("Updated!");
      } else {
        await axios.post('/api/products', productData);
        toast.success("Added!");
      }
      setIsModalOpen(false); setEditingProduct(null); fetchProducts();
    } catch (err) { toast.error("Save Error"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete product?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success("Deleted!"); fetchProducts();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic uppercase">Inventory</h1>
          <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs">+ Add Product</button>
        </header>
        <div className="bg-white p-4 rounded-3xl mb-8 flex items-center gap-4">
          <Search className="text-slate-400" />
          <input type="text" placeholder="Search..." className="flex-1 outline-none font-bold italic" onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
            <div key={product._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100">
              <h3 className="font-black text-slate-800 uppercase italic truncate">{product.name}</h3>
              <p className="text-[10px] font-black text-indigo-500 mb-4">{product.code}</p>
              <div className="flex justify-between items-end">
                <p className="text-xl font-black">Rs. {product.price}</p>
                <p className="text-lg font-black text-emerald-500 italic">{product.qty} PCS</p>
              </div>
              <div className="mt-6 flex gap-2 pt-4 border-t">
                <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="flex-1 py-3 bg-slate-50 rounded-xl hover:text-indigo-600"><Edit2 size={16} className="mx-auto"/></button>
                <button onClick={() => setSelectedForBarcode(product)} className="flex-1 py-3 bg-slate-50 rounded-xl hover:text-blue-600"><Barcode size={16} className="mx-auto"/></button>
                <button onClick={() => handleDelete(product._id)} className="flex-1 py-3 bg-slate-50 rounded-xl hover:text-rose-600"><Trash2 size={16} className="mx-auto"/></button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="hidden">
        {selectedForBarcode && <PrintableBarcode ref={barcodeRef} product={selectedForBarcode} businessName="Digi Solutions" />}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300"><X size={24}/></button>
              <h2 className="text-2xl font-black italic uppercase mb-8">{editingProduct ? 'Edit' : 'Add'} Product</h2>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <input name="name" placeholder="Name" defaultValue={editingProduct?.name} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                <input name="code" placeholder="Code" defaultValue={editingProduct?.code} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="qty" type="number" placeholder="Qty" defaultValue={editingProduct?.qty} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                  <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs">Save Product</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Inventory;
