import React from 'react';
import Barcode from 'react-barcode';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;

  // Discount thiyenawanam price eka calculate karamu
  const sellingPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div ref={ref} className="w-[50mm] h-[25mm] bg-white text-black font-sans overflow-hidden">
      {/* Printer settings logic */}
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>

      <div className="h-full flex flex-col items-center justify-between p-1">
        
        {/* Business Name (Header) */}
        <div className="text-[8px] font-black uppercase tracking-widest text-center w-full leading-none mb-0.5">
          {businessName || "DIGI SOLUTIONS"}
        </div>

        {/* Product Name (Bold) */}
        <div className="text-[10px] font-black text-center truncate w-full px-1 leading-tight uppercase">
          {product.name}
        </div>

        {/* The Barcode */}
        <div className="flex justify-center items-center w-full scale-y-110">
          <Barcode 
            value={product.code || "000000"} 
            width={1.1} 
            height={30} 
            fontSize={8}
            margin={0}
            background="transparent"
            displayValue={true}
          />
        </div>

        {/* Price Section */}
        <div className="w-full flex justify-center items-center mt-0.5 border-t border-dashed border-black/20 pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[8px] font-bold uppercase">Price:</span>
            <span className="text-[12px] font-black italic tracking-tighter">
              Rs.{Number(sellingPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
