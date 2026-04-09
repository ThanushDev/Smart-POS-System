import React from 'react';

interface PrintableBillProps {
  invoiceNumber: string;
  items: any[];
  total: number;
  businessName: string;
  businessLogo?: string;
  businessMobile?: string; // අලුතින් එකතු කරන ලදී
  date?: string;
  time?: string;
}

const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>((props, ref) => {
  const { invoiceNumber, items, total, businessName, businessLogo, businessMobile, date, time } = props;

  return (
    <div ref={ref} className="print:block hidden p-8 bg-white text-black w-[80mm] mx-auto text-sm font-sans">
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { padding: 5mm; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        {businessLogo && <img src={businessLogo} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />}
        <h2 className="text-xl font-bold uppercase">{businessName}</h2>
        {/* දුරකථන අංකය පෙන්වන පේළිය */}
        {businessMobile && <p className="text-xs font-bold">Tel: {businessMobile}</p>}
        <p className="text-xs mt-1">Invoice: #{invoiceNumber}</p>
        <p className="text-[10px]">{date} | {time}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-4 border-b">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="py-1">Item</th>
            <th className="py-1 text-center">Qty</th>
            <th className="py-1 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="text-[12px]">
              <td className="py-1 truncate max-w-[40mm]">{item.name}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>Total:</span>
        <span>Rs. {total.toLocaleString()}</span>
      </div>

      <div className="text-center text-[10px] mt-8 italic border-t pt-2">
        Thank you for your business!
      </div>
    </div>
  );
});

PrintableBill.displayName = 'PrintableBill';
export default PrintableBill;
