// ... ඉතිරි imports ...
// handleSaveProduct function එක ඇතුළත discount එකතු කරන්න:
const handleSaveProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const productData = {
    name: formData.get('name'),
    code: formData.get('code'),
    price: Number(formData.get('price')),
    qty: Number(formData.get('qty')),
    discount: Number(formData.get('discount') || 0) // Discount එක
  };
  // ... axios call ...
};

// Modal එක ඇතුළත Input එක:
<div className="grid grid-cols-3 gap-4">
  <input name="qty" type="number" placeholder="Qty" defaultValue={editingProduct?.qty} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
  <input name="price" type="number" placeholder="Price" defaultValue={editingProduct?.price} required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
  <input name="discount" type="number" placeholder="Disc %" defaultValue={editingProduct?.discount} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-orange-600" />
</div>
