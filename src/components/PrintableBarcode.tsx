import React from 'react';

const PrintableBarcode = ({ product, businessName }: any) => {
  if (!product) return null;

  return (
    <div id="barcode-to-print" style={{ 
      width: '50mm', 
      height: '25mm', 
      padding: '10px', 
      backgroundColor: 'white', 
      color: 'black', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{businessName}</div>
      <div style={{ fontSize: '8px', marginBottom: '2px' }}>{product.name}</div>
      
      {/* Barcode image එකක් විදිහට canvas එකක් use කරනවා */}
      <canvas id="barcode-canvas"></canvas>
      
      <div style={{ fontSize: '12px', fontWeight: 'bold', borderTop: '1px solid black', width: '100%', textAlign: 'center', marginTop: '2px' }}>
        Rs.{Number(product.price).toLocaleString()}
      </div>
    </div>
  );
};

export default PrintableBarcode;
