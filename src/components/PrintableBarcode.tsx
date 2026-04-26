import React from 'react';
import Barcode from 'react-barcode';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div ref={ref} className="w-[50mm] h-[25mm] bg-white text-black font-sans p-2 flex flex-col items-center justify-between border border-slate-100">
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>
      <div className="text-[9px] font-black uppercase text-center w-full leading-none">{businessName || "DIGI SOLUTIONS"}</div>
      <div className="text-[8px] font-bold text-center truncate w-full italic uppercase mt-1">{product.name}</div>
      <div className="flex justify-center items-center w-full py-1">
        <Barcode value={product.code || "000000"} width={1.2} height={35} fontSize={10} margin={0} renderer="svg" />
      </div>
      <div className="text-[12px] font-black italic border-t border-dashed border-black/20 w-full text-center pt-1 leading-none">
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
