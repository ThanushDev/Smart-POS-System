import React, { forwardRef } from 'react';

const PrintableBill = forwardRef(({ invoiceId, cart, total, discountTotal, businessInfo, currentUser, date, time }: any, ref: any) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-[12px] w-[80mm]">
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <h2 className="text-lg font-black uppercase tracking-tighter">{businessInfo?.name || 'Digi Solutions'}</h2>
        <p className="text-[10px]">WhatsApp: {businessInfo?.whatsapp || 'N/A'}</p>
        <p className="text-[9px] mt-1">{date} | {time}</p>
      </div>

      {/* Info */}
      <div className="mb-2 text-[10px] space-y-0.5">
        <p>INVOICE: #{invoiceId}</p>
        <p>CASHIER: {currentUser?.name || 'Admin'}</p>
      </div>

      {/* Table */}
      <table className="w-full mb-2 border-b border-dashed border-black">
        <thead className="border-b border-black">
          <tr className="text-[10px]">
            <th className="text-left py-1">ITEM</th>
            <th className="text-right py-1">QTY</th>
            <th className="text-right py-1">UNIT</th>
            <th className="text-right py-1">SUB</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-slate-200">
          {cart.map((item: any, i: number) => (
            <tr key={i} className="text-[10px]">
              <td className="py-2 uppercase leading-tight">{item.name}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{item.price.toFixed(2)}</td>
              <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-1 text-right">
        {discountTotal > 0 && (
          <p className="text-[10px] font-bold">DISCOUNT: - Rs. {Number(discountTotal).toFixed(2)}</p>
        )}
        <div className="border-t border-black pt-1">
          <p className="text-sm font-black uppercase">NET TOTAL: Rs. {Number(total).toFixed(2)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-2 border-t border-dashed border-black">
        <p className="uppercase font-black text-[11px] italic">Thank You Come Again!</p>
        <p className="text-[8px] mt-2 opacity-70 italic text-slate-500">
          System by Digi Solutions
        </p>
      </div>
    </div>
  );
});

export default PrintableBill;
