import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode'; // Mehema direct ganna

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && product?.code) {
      JsBarcode(svgRef.current, product.code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
      });
    }
  }, [product]); // Product eka change wenakota lines update wenawa

  if (!product) return null;

  return (
    <div ref={ref} style={{ width: '50mm', height: '25mm', padding: '10px', background: 'white' }}>
      <p style={{ textAlign: 'center', margin: 0, fontWeight: 'bold' }}>{businessName}</p>
      <svg ref={svgRef} style={{ width: '100%' }}></svg>
    </div>
  );
});

export default PrintableBarcode;
