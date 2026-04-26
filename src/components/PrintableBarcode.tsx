import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Barcode script eka dynamic load karanawa
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    script.async = true;
    script.onload = () => {
      if (svgRef.current && product?.code) {
        // @ts-ignore
        window.JsBarcode(svgRef.current, product.code, {
          format: "CODE128",
          width: 2,
          height: 50,
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
      style={{ 
        width: '50mm', 
        height: '25mm', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      {/* Business Name */}
      <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', width: '100%', lineHeight: '1' }}>
        {businessName}
      </div>

      {/* Product Name */}
      <div style={{ fontSize: '8px', fontWeight: '700', textAlign: 'center', width: '100%', fontStyle: 'italic', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '2px' }}>
        {product.name}
      </div>

      {/* Barcode SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '45px' }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Price */}
      <div style={{ fontSize: '13px', fontWeight: '900', fontStyle: 'italic', borderTop: '1px dashed #000', width: '100%', textAlign: 'center', marginTop: '2px', paddingTop: '2px' }}>
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
