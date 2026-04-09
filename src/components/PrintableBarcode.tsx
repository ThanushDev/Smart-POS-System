import React from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  return (
    <div ref={ref} className="print:block hidden w-[50mm] h-[30mm] p-1 bg-white text-black">
      <style>{`@media print { @page { size: 50mm 30mm; margin: 0; } }`}</style>
      <div className="border border-gray-300 h-full flex flex-col items-center justify-between p-1">
        <div className="text-[9px] font-bold uppercase truncate w-full text-center">{businessName}</div>
        <div className="text-[10px] font-semibold text-center truncate w-full px-1">{product?.name}</div>
        <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${product?.code}&scale=2&height=10`} alt="barcode" className="h-10 object-contain" />
        <div className="w-full flex justify-between items-center px-1 border-t border-dotted">
          <span className="text-[8px] font-mono">{product?.code}</span>
          <span className="text-[12px] font-black italic">Rs.{product?.price}</span>
        </div>
      </div>
    </div>
  );
});
export default PrintableBarcode;
