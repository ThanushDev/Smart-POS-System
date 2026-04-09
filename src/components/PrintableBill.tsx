import React from 'react';

const PrintableBill = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { invoiceId, cart, total, paymentMethod, currentUser, businessInfo, date, time } = props;

  // මුළු වට්ටම ගණනය කිරීම (Item discount x Quantity)
  const totalDiscount = cart.reduce((sum: number, item: any) => sum + ((item.discount || 0) * item.quantity), 0);
  const subTotal = total + totalDiscount;

  if (!businessInfo) return null;

  return (
    <div ref={ref} className="print:block hidden p-4 w-[80mm] font-mono text-[11px] bg-white text-black">
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { padding: 3mm; background: white; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center border-b-2 border-dashed pb-2 mb-2">
        <h2 className="text-sm font-black uppercase tracking-tighter">{businessInfo.name}</h2>
        <p className="text-[9px]">{businessInfo.address || 'Colombo, Sri Lanka'}</p>
        <p className="text-[10px] font-bold">WhatsApp: {businessInfo.whatsapp}</p>
        <div className="mt-2 border-t border-black pt-1">
          <p className="font-black uppercase">Tax Invoice: #{invoiceId}</p>
          <p className="text-[8px]">{date} | {time}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-2">
        <thead className="border-b border-black">
          <tr className="text-left text-[10px]">
            <th className="py-1">DESCRIPTION</th>
            <th className="text-center">QTY</th>
            <th className="text-right">PRICE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cart.map((item: any, i: number) => (
            <tr key={i}>
              <td className="py-1 uppercase">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="border-t-2 border-dashed pt-2 space-y-1">
        <div className="flex justify-between">
          <span>GROSS TOTAL</span>
          <span>{subTotal.toLocaleString()}</span>
        </div>
        
        {totalDiscount > 0 && (
          <div className="flex justify-between italic text-gray-700">
            <span>TOTAL DISCOUNT (-)</span>
            <span>{totalDiscount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between font-black text-[14px] border-t border-black pt-1">
          <span>NET AMOUNT</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-[9px] uppercase border-t border-dotted pt-2">
        <p className="flex justify-between"><span>Payment Method:</span> <b>{paymentMethod}</b></p>
        <p className="flex justify-between"><span>Cashier:</span> <b>{currentUser?.name || 'Admin'}</b></p>
      </div>

      {/* Thank You Note */}
      <div className="text-center mt-6 border-t-2 border-dashed pt-2">
        <p className="font-black italic tracking-widest uppercase">--- THANK YOU ---</p>
        <p className="text-[8px] mt-1 italic">Please visit us again!</p>
        <p className="text-[7px] mt-4 opacity-50 uppercase tracking-tighter">Software by Digi Solutions Support</p>
      </div>
    </div>
  );
});

export default PrintableBill;
