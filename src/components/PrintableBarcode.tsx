import React from 'react';

const PrintableBarcode = React.forwardRef<HTMLDivElement, any>(({ product, businessName }, ref) => {
  if (!product) return null;
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-2 flex flex-col items-center justify-between"
      style={{ width: '50mm', height: '25mm', overflow: 'hidden', textAlign: 'center', fontFamily: 'sans-serif' }}
    >
      <style>{`
        @media print { 
          @page { size: 50mm 25mm; margin: 0; } 
          body { -webkit-print-color-adjust: exact; margin: 0; }
        }
      `}</style>

      <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{businessName}</div>
      <div style={{ fontSize: '8px', fontWeight: '700', fontStyle: 'italic', margin: '2px 0' }}>{product.name}</div>
      
      {/* Barcode representation - Simple bars to ensure it's not blank */}
      <div style={{ display: 'flex', justifyContent: 'center', height: '35px', width: '100%', background: '#eee', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', border: '1px solid #ddd' }}>
        |||| | || ||| | || <br/> {product.code}
      </div>

      <div style={{ fontSize: '12px', fontWeight: '900', borderTop: '1px dashed #000', width: '100%', marginTop: '2px', paddingTop: '2px' }}>
        Rs.{Number(finalPrice).toLocaleString()}
      </div>
    </div>
  );
});

PrintableBarcode.displayName = "PrintableBarcode";
export default PrintableBarcode;
