import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (window.JsBarcode && canvasRef.current && product?.code) {
      // @ts-ignore
      window.JsBarcode(canvasRef.current, product.code, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 0,
        background: "#ffffff"
      });
    }
  }, [product]);

  if (!product) return null;

  return (
    <div ref={ref} style={{ width: '50mm', height: '25mm', padding: '5px', backgroundColor: 'white', color: 'black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @media print {
          @page { size: 50mm 25mm; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; }
        }
      `}</style>
      <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', textAlign: 'center' }}>{businessName}</div>
      <div style={{ fontSize: '8px', marginBottom: '2px' }}>{product.name}</div>
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }}></canvas>
      <div style={{ fontSize: '11px', fontWeight: 'bold', borderTop: '1px solid black', width: '100%', textAlign: 'center', marginTop: '2px' }}>
        Rs.{Number(product.price).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
