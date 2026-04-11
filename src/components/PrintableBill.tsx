import React, { forwardRef } from 'react';

const PrintableBill = forwardRef(({ invoiceId, cart, total, discountTotal, businessInfo, currentUser, date, time }: any, ref: any) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-[12px] w-[80mm]">
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <h2 className="text-lg font-black uppercase tracking-tighter leading-none">{businessInfo?.name || 'Digi Solutions'}</h2>
        <p className="text-[10px] mt-1">WhatsApp: {businessInfo?.whatsapp || 'N/A'}</p>
        <p className="text-[9px]">{date} | {time}</p>
      </div>

      <div className="mb-2 text-[10px] space-y-0.5 uppercase font-bold">
        <p>INV: #{invoiceId}</p>
        <p>Cashier: {currentUser?.name || 'Staff'}</p>
      </div>

      <table className="w-full mb-2 border-b border-dashed border-black">
        <thead>
          <tr className="text-[10px] border-b border-black text-left">
            <th className="pb-1">ITEM</th>
            <th className="text-right pb-1">QTY</th>
            <th className="text-right pb-1">SUB</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item: any, i: number) => (
            <tr key={i} className="text-[10px] align-top">
              <td className="py-1">
                <span className="uppercase font-bold block">{item.name}</span>
                {item.unitDiscount > 0 && (
                  <span className="text-[8px] opacity-70 italic block">
                    (Price: {item.price} - Disc: {item.unitDiscount})
                  </span>
                )}
              </td>
              <td className="text-right py-1">{item.quantity}</td>
              <td className="text-right py-1">{((item.price - item.unitDiscount) * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-1 font-bold">
        {discountTotal > 0 && (
          <p className="text-[10px] italic">Total Savings: - Rs. {discountTotal.toFixed(2)}</p>
        )}
        <div className="border-t border-black pt-1">
          <p className="text-sm font-black uppercase">Net Total: Rs. {total.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mt-6 pt-2 border-t border-dashed border-black">
        <p className="uppercase font-black text-[11px] italic tracking-widest leading-none">Thank You Come Again!</p>
        <p className="text-[8px] mt-2 opacity-50 italic">System by Digi Solutions</p>
      </div>
    </div>
  );
});

export default PrintableBill;
