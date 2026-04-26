import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Dynamic load JsBarcode script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    script.async = true;
    script.onload = () => {
      if (svgRef.current && product?.code) {
        try {
          // @ts-ignore
          window.JsBarcode(svgRef.current, product.code, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 14,
            margin: 0,
            background: "#ffffff"
          });
        } catch (err) {
          console.error("Barcode error:", err);
        }
      }
    };
    document.body.appendChild(script);
    return () => { 
      if (document.body.contains(script)) document.body.removeChild(script); 
    };
  }, [product]);

  if (!product) return null;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div ref={ref} className="bg-white text-black p-4 flex flex-col items-center justify-center" style={{ width: '50mm', height: '25mm', overflow: 'hidden' }}>
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0 !important; }
          .barcode-svg { display: block !important; }
        }
      `}</style>
      
      <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
        {businessName}
      </div>
      
      <div style={{ fontSize: '8px', fontWeight: '700', textAlign: 'center', width: '100%', fontStyle: 'italic', marginBottom: '2px' }}>
        {product.name}
      </div>

      <div className="barcode-svg" style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '45px' }}>
        <svg ref={svgRef}></svg>
      </div>

      <div style={{ fontSize: '12px', fontWeight: '900', borderTop: '1px dashed #000', width: '100%', textAlign: 'center', marginTop: '2px', paddingTop: '2px' }}>
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
