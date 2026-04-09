import React from 'react';
    import { format } from 'date-fns';

    interface BillItem {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }

    interface PrintableBillProps {
      invoiceNumber: string;
      items: BillItem[];
      total: number;
      businessName: string;
      businessLogo?: string;
      date?: string;
      time?: string;
    }

    const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ 
      invoiceNumber, 
      items, 
      total, 
      businessName,
      businessLogo,
      date,
      time
    }, ref) => {
      return (
        <div ref={ref} className="p-8 bg-white text-slate-900 max-w-[400px] mx-auto print:block hidden">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 mb-2">
              {businessLogo && (
                <img src={businessLogo} alt="Logo" className="w-16 h-16 object-contain" />
              )}
              <h1 className="text-2xl font-bold uppercase">{businessName}</h1>
            </div>
            <p className="text-sm text-slate-600">Invoice</p>
          </div>

          <div className="border-y border-slate-200 py-3 mb-4 text-sm">
            <div className="flex justify-between">
              <span>Invoice #:</span>
              <span className="font-mono">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{date || format(new Date(), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{time || format(new Date(), 'HH:mm:ss')}</span>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">Rs. {(item.price * item.quantity).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center font-bold text-lg border-t-2 border-slate-900 pt-4">
            <span>TOTAL AMOUNT</span>
            <span>Rs. {total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="text-center mt-10 pt-6 border-t border-dashed border-slate-300">
            <p className="font-medium mb-1">Thank You!</p>
            <p className="text-xs text-slate-500 italic">Please Come Again.</p>
          </div>
        </div>
      );
    });

    PrintableBill.displayName = 'PrintableBill';

    export default PrintableBill;
