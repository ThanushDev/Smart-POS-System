import React from 'react';
import Barcode from 'react-barcode';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;
  
  // Price calculation with discount
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-2 flex flex-col items-center justify-center border border-slate-100"
      style={{ width: '50mm', height: '25mm', margin: '0 auto' }}
    >
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>

      {/* Business Name */}
      <div className="text-[10px] font-black uppercase text-center w-full leading-none mb-1">
        {businessName || "DIGI SOLUTIONS"}
      </div>

      {/* Product Name */}
      <div className="text-[8px] font-bold text-center truncate w-full italic uppercase mb-1">
        {product.name}
      </div>

      {/* Barcode - Using Canvas for faster rendering */}
      <div className="flex justify-center items-center w-full">
        <Barcode 
          value={product.code || "000000"} 
          width={1.2} 
          height={30} 
          fontSize={10} 
          margin={0} 
          renderer="canvas" 
        />
      </div>

      {/* Price */}
      <div className="text-[12px] font-black italic w-full text-center mt-1 leading-none">
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
