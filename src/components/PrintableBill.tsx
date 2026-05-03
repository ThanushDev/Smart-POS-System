import React from 'react';

const PrintableBill = ({ invoiceId, cart, total, currentUser, date, time, businessInfo }: any) => {
  // Shop එකේ number එක මුලින්ම check කරලා බලනවා (N/A නොවී ලස්සනට පෙන්වන්න)
  const shopPhone = businessInfo?.phone || businessInfo?.telephone || '';

  return (
    <div id="printable-bill-area" style={{ 
      width: '80mm', 
      padding: '4mm', 
      fontFamily: 'monospace', 
      color: '#000', 
      backgroundColor: '#fff',
      fontSize: '12px',
      lineHeight: '1.2'
    }}>
      {/* Shop Header */}
      <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
        <h2 style={{ margin: '0 0 1mm 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {businessInfo?.name || 'RETAIL SHOP'}
        </h2>
        
        {/* ඇඩ්‍රස් එක තියෙනවා නම් විතරක් පෙන්වනවා */}
        {businessInfo?.address && (
          <p style={{ margin: 0, fontSize: '11px' }}>{businessInfo.address}</p>
        )}

        {/* Shop එකේ number එක තියෙනවා නම් විතරක් පෙන්වනවා (N/A පෙන්වන්නේ නැත) */}
        {shopPhone && (
          <p style={{ margin: 0, fontSize: '11px' }}>Tel: {shopPhone}</p>
        )}
      </div>

      {/* Invoice Meta Data */}
      <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '2mm 0', marginBottom: '2mm', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>INV: {invoiceId}</span>
          <span>CASHIER: {currentUser?.name || 'ADMIN'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>DATE: {date}</span>
          <span>TIME: {time}</span>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', paddingBottom: '1mm' }}>ITEM</th>
            <th style={{ textAlign: 'center' }}>QTY</th>
            <th style={{ textAlign: 'right' }}>PRICE</th>
            <th style={{ textAlign: 'right' }}>DISC</th>
            <th style={{ textAlign: 'right' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(cart || []).map((item: any, index: number) => {
            const itemPrice = Number(item?.price) || 0;
            const itemQty = Number(item?.quantity) || 0;
            const itemDisc = (Number(item?.unitDiscount) || 0) * itemQty;
            const itemTotal = (itemPrice * itemQty) - itemDisc;

            return (
              <tr key={index}>
                <td style={{ padding: '1mm 0', textTransform: 'uppercase', maxWidth: '30mm', wordWrap: 'break-word' }}>
                  {item?.name}
                </td>
                <td style={{ textAlign: 'center' }}>{itemQty}</td>
                <td style={{ textAlign: 'right' }}>{itemPrice.toFixed(0)}</td>
                <td style={{ textAlign: 'right' }}>{itemDisc > 0 ? `-${itemDisc.toFixed(0)}` : '0'}</td>
                <td style={{ textAlign: 'right' }}>{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Section */}
      <div style={{ borderTop: '1px solid #000', marginTop: '2mm', paddingTop: '2mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
          <span>NET TOTAL:</span>
          <span>Rs.{(Number(total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Footer & Developer Branding */}
      <div style={{ textAlign: 'center', marginTop: '6mm' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>THANK YOU COME AGAIN!</p>
        
        <div style={{ marginTop: '4mm', borderTop: '0.5px solid #eee', paddingTop: '2mm' }}>
          <p style={{ margin: 0, fontSize: '9px', color: '#555', letterSpacing: '1px' }}>
            Software by <b>DIGI SOLUTIONS</b>
          </p>
          <p style={{ margin: 0, fontSize: '9px', color: '#777', fontWeight: 'bold' }}>
            Contact: 0764781212
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintableBill;
