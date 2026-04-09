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
    <div ref={ref} className="print:block hidden p-2 w-[50mm] h-[30mm] text-center bg-white text-black">
      <style>{`
        @media print {
          @page { size: 50mm 30mm; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; }
        }
      `}</style>
      <div className="text-[10px] font-bold uppercase truncate mb-1">{product.name}</div>
      <div className="flex justify-center mb-1">
        <img 
          src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${product.code}&scale=2&rotate=N&includetext`} 
          alt={product.code}
          className="h-10 w-full object-contain"
        />
      </div>
      <div className="text-[12px] font-bold mt-1">Rs. {product.price.toLocaleString('en-LK')}</div>
    </div>
  );
});

PrintableBarcode.displayName = 'PrintableBarcode';
export default PrintableBarcode;
