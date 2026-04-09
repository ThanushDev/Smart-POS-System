import React from 'react';

interface BarcodeProps {
  product: {
    name: string;
    code: string;
    price: number;
  };
}

const PrintableBarcode = React.forwardRef<HTMLDivElement, BarcodeProps>(({ product }, ref) => {
  return (
    <div ref={ref} className="print:block hidden p-4 w-[50mm] text-center bg-white text-black">
      <style>{`
        @media print {
          @page { size: 50mm 30mm; margin: 0; }
          body { margin: 0; }
        }
      `}</style>
      <div className="text-[10px] font-bold uppercase truncate">{product.name}</div>
      <div className="flex justify-center my-1">
        {/* Google Chart API භාවිතයෙන් Barcode එකක් නිර්මාණය කිරීම */}
        <img 
          src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${product.code}&scale=2&rotate=N&includetext`} 
          alt={product.code}
          className="h-10 w-full object-contain"
        />
      </div>
      <div className="text-[10px] font-mono">{product.code}</div>
      <div className="text-[12px] font-bold">Rs. {product.price.toLocaleString()}</div>
    </div>
  );
});

PrintableBarcode.displayName = 'PrintableBarcode';
export default PrintableBarcode;
