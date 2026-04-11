import React, { forwardRef } from 'react';

interface PrintableBillProps {
  invoiceId: string;
  cart: any[];
  total: number;
  discountTotal: number;
  paymentMethod?: string;
  businessInfo: any;
  currentUser: { name: string };
  date: string;
  time: string;
}

const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>((props, ref) => {
  const { invoiceId, cart, total, discountTotal, paymentMethod, businessInfo, currentUser, date, time } = props;

  // දත්ත නොමැති නම් කිසිවක් පෙන්වන්නේ නැත (Blank වැළැක්වීමට)
  if (!invoiceId) return null;

  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-[12px] leading-tight w-[80mm]">
      {/* Business Header */}
      <div className="text-center mb-4 border-b border-black pb-2 border-dashed">
        <h2 className="text-lg font-black uppercase">{businessInfo?.name || 'DIGI SOLUTIONS'}</h2>
        <p className="text-[10px]">{businessInfo?.address || 'Your Business Address Here'}</p>
        <p className="text-[10px]">Tel: {businessInfo?.whatsapp || 'Your Phone'}</p>
      </div>

      {/* Bill Info */}
      <div className="mb-4 text-[10px]">
        <div className="flex justify-between">
          <span>Date: {date}</span>
          <span>Time: {time}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold uppercase">Invoice: #{invoiceId}</span>
          <span className="uppercase">Cashier: {currentUser?.name || 'Admin'}</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="border-b border-black border-dashed mb-1 pb-1 flex font-bold uppercase text-[10px]">
        <div className="flex-[3]">Item</div>
        <div className="flex-1 text-center">Qty</div>
        <div className="flex-1 text-right">Price</div>
        <div className="flex-[1.5] text-right">Total</div>
      </div>

      {/* Product Items */}
      <div className="space-y-1 mb-4 border-b border-black border-dashed pb-2">
        {cart && cart.map((item, index) => (
          <div key={index} className="flex text-[10px] uppercase">
            <div className="flex-[3] truncate">{item.name}</div>
            <div className="flex-1 text-center">{item.quantity}</div>
            <div className="flex-1 text-right">{(item.price - (item.unitDiscount || 0)).toFixed(0)}</div>
            <div className="flex-[1.5] text-right">
              {((item.price - (item.unitDiscount || 0)) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Sub Total:</span>
          <span>Rs. {(total + (discountTotal || 0)).toFixed(2)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between font-bold">
            <span>Total Discount:</span>
            <span>- Rs. {discountTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black border-t border-black pt-1 mt-1 uppercase">
          <span>Net Amount:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-4 text-[10px] border-t border-black border-dashed pt-2">
        <p className="uppercase">Payment Method: {paymentMethod || 'Cash'}</p>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-2 border-t border-black">
        <p className="font-bold uppercase tracking-widest text-[10px]">Thank You! Come Again.</p>
        <p className="text-[8px] mt-1 italic">Software by Digi Solutions</p>
      </div>

      {/* CSS to ensure visibility during print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { color: black !important; background: white !important; }
          .print-area { display: block !important; visibility: visible !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      ` }} />
    </div>
  );
});

PrintableBill.displayName = 'PrintableBill';

export default PrintableBill;
