import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Window එකේ JsBarcode තියෙනවා නම් විතරක් instant draw කරනවා
    // @ts-ignore
    if (window.JsBarcode && svgRef.current && product?.code) {
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
  }, [product]);

  if (!product) return null;

  return (
    <div ref={ref} style={{ width: '50mm', height: '25mm', padding: '10px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{businessName}</div>
      <div style={{ fontSize: '8px' }}>{product.name}</div>
      <svg ref={svgRef}></svg>
      <div style={{ fontSize: '12px', fontWeight: 'bold', borderTop: '1px dashed black', width: '100%', textAlign: 'center' }}>
        Rs.{Number(product.price).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
