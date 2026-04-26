import React from 'react';
import Barcode from 'react-barcode';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div ref={ref} className="w-[50mm] h-[25mm] bg-white text-black font-sans overflow-hidden">
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>

      <div className="h-full flex flex-col items-center justify-between p-2 border border-slate-100">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-center w-full leading-none">
          {businessName || "DIGI SOLUTIONS"}
        </div>

        <div className="text-[10px] font-black text-center truncate w-full px-1 uppercase leading-tight">
          {product.name}
        </div>

        <div className="flex justify-center items-center w-full">
          {/* Renderer eka SVG damma, print weddi kanne nathi wenna */}
          <Barcode 
            value={product.code || "000000"} 
            width={1.2} 
            height={30} 
            fontSize={8}
            margin={0}
            background="transparent"
            displayValue={true}
            renderer="svg" 
          />
        </div>

        <div className="w-full flex justify-center items-center border-t border-dashed border-black/20 pt-0.5 mt-0.5">
          <span className="text-[12px] font-black italic">
            Rs.{Number(finalPrice).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
