import React from 'react';
import Barcode from 'react-barcode';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;

  return (
    <div ref={ref} className="w-[50mm] h-[30mm] p-1 bg-white text-black font-sans">
      {/* පින්ට් කරන විට පමණක් අවශ්‍ය Page Settings */}
      <style>{`
        @media print { 
          @page { size: 50mm 30mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="border-[1.5px] border-slate-800 h-full flex flex-col items-center justify-between p-1 rounded-sm">
        
        {/* Brand Name */}
        <div className="text-[10px] font-black uppercase truncate w-full text-center leading-tight border-b border-slate-200 pb-0.5">
          {businessName || "DIGI SOLUTIONS"}
        </div>

        {/* Product Name */}
        <div className="text-[9px] font-bold text-center truncate w-full px-1 mt-0.5 uppercase">
          {product.name}
        </div>

        {/* Barcode - React Barcode Library එක භාවිතා කර */}
        <div className="flex justify-center items-center w-full scale-90 -my-1">
          <Barcode 
            value={product.code || "000000"} 
            width={1.2} 
            height={35} 
            fontSize={10}
            margin={0}
            background="transparent"
          />
        </div>

        {/* Footer: Code & Price */}
        <div className="w-full flex justify-between items-end px-1 pt-0.5 border-t border-dashed border-slate-400">
          <div className="text-right leading-none">
            <span className="text-[13px] font-black italic tracking-tighter">
              Rs.{Number(product.price).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
