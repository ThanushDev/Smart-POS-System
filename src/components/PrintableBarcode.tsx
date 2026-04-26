import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Dynamic load JsBarcode only when needed
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
    return () => { 
      if (document.body.contains(script)) document.body.removeChild(script); 
    };
  }, [product]);

  if (!product) return null;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div ref={ref} style={{ width: '50mm', height: '25mm', padding: '10px', backgroundColor: 'white', color: 'black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>
      <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{businessName}</div>
      <div style={{ fontSize: '8px', fontStyle: 'italic', marginBottom: '2px' }}>{product.name}</div>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
      <div style={{ fontSize: '12px', fontWeight: 'bold', borderTop: '1px dashed #000', width: '100%', textAlign: 'center', marginTop: '2px' }}>
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
