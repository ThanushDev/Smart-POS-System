import React, { useEffect, useRef } from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (window.JsBarcode && canvasRef.current && product?.code) {
      try {
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
      } catch (err) {
        console.error("Barcode error:", err);
      }
    }
  }, [product]);

  if (!product) return null;

  return (
    <div ref={ref} className="barcode-sticker">
      <style>{`
        @media print {
          @page {
            size: 50mm 25mm;
            margin: 0;
          }
          .barcode-sticker {
            width: 50mm;
            height: 25mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white;
            color: black;
            padding: 2mm;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          canvas {
            max-width: 100%;
            height: auto !important;
          }
        }
        /* Screen preview settings */
        .barcode-sticker {
          width: 50mm;
          height: 25mm;
          background: white;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #ccc;
        }
      `}</style>
      
      <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>
        {businessName}
      </div>
      
      <div style={{ fontSize: '8px', marginBottom: '2px', textAlign: 'center' }}>
        {product.name}
      </div>

      <canvas ref={canvasRef}></canvas>

      <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px', borderTop: '1px solid black', width: '100%', textAlign: 'center', paddingTop: '2px' }}>
        Rs. {Number(product.price).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
