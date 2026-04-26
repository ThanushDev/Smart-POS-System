import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Barcode script eka dynamic load karagannawa install karanna bari nisa
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    script.async = true;
    script.onload = () => {
      if (barcodeRef.current && product?.code) {
        // @ts-ignore
        window.JsBarcode(barcodeRef.current, product.code, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 0
        });
      }
    };
    document.body.appendChild(script);
    
    return () => { document.body.removeChild(script); };
  }, [product]);

  if (!product) return null;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-2 flex flex-col items-center justify-between"
      style={{ width: '50mm', height: '25mm', overflow: 'hidden' }}
    >
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>

      <div className="text-[10px] font-black uppercase text-center w-full leading-none">
        {businessName}
      </div>

      <div className="text-[8px] font-bold text-center truncate w-full italic uppercase">
        {product.name}
      </div>

      {/* Canvas eka use karanne barcode eka draw karanna */}
      <div className="flex justify-center items-center w-full py-1">
        <canvas ref={barcodeRef} style={{ maxWidth: '100%' }}></canvas>
      </div>

      <div className="text-[12px] font-black italic border-t border-dashed border-black/20 w-full text-center pt-1 leading-none">
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
