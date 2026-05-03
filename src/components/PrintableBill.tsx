import React from 'react';

const PrintableBill = ({ invoiceId, cart, total, currentUser, date, time, businessInfo }: any) => {
  return (
    <div style={{ width: '80mm', padding: '5mm', fontFamily: 'monospace', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{businessInfo?.name || 'DIGI SOLUTIONS'}</h2>
        <p style={{ margin: 0, fontSize: '11px' }}>{businessInfo?.email || ''}</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', marginBottom: '2mm', fontSize: '11px' }}>
        <p style={{ margin: '1mm 0' }}>INV: {invoiceId || 'N/A'}</p>
        <p style={{ margin: '1mm 0' }}>DATE: {date} {time}</p>
        <p style={{ margin: '1mm 0' }}>CASHIER: {currentUser?.name || 'ADMIN'}</p>
      </div>

      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left' }}>ITEM</th>
            <th style={{ textAlign: 'center' }}>QTY</th>
            <th style={{ textAlign: 'right' }}>PRICE</th>
          </tr>
        </thead>
        <tbody>
          {(cart || []).map((item: any, index: number) => (
            <tr key={index}>
              <td style={{ padding: '1mm 0', textTransform: 'uppercase' }}>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>
                {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', marginTop: '3mm', paddingTop: '2mm', fontSize: '14px', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>TOTAL:</span>
          <span>Rs.{(Number(total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '6mm', fontSize: '10px' }}>
        <p>THANK YOU COME AGAIN!</p>
        <p style={{ fontSize: '8px' }}>POS System by Digi Solutions</p>
      </div>
    </div>
  );
};

export default PrintableBill;
