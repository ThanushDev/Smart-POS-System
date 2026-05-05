import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PrintableBill from '../components/PrintableBill';

const PrintPage = () => {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL එකේ තියෙන ?id=... එක ලබා ගැනීම
    const urlParams = new URLSearchParams(window.location.search);
    const mongoId = urlParams.get('id');

    if (mongoId) {
      axios.get(`/api/invoices/single/${mongoId}`)
        .then(res => {
          setInvoiceData(res.data);
          setLoading(false);
          // දත්ත ලැබුණු පසු ස්වයංක්‍රීයව Print Dialog එක Open කිරීම
          setTimeout(() => {
            window.print();
          }, 1000);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  }, []);

  if (loading) return <div className="p-10 text-center font-bold italic uppercase tracking-widest text-slate-400">Fetching Record from MongoDB...</div>;
  if (!invoiceData) return <div className="p-10 text-center font-bold text-rose-500">Invoice Not Found!</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* ඔයාගේ දැනට තියෙන PrintableBill Component එකට දත්ත යැවීම */}
      <PrintableBill 
        cart={invoiceData.items} 
        total={invoiceData.total} 
        invoiceId={invoiceData.invoiceId} 
        date={new Date(invoiceData.createdAt || invoiceData.date).toLocaleString()}
        currentUser={{ name: invoiceData.cashier }} // Cashier ගේ නම මෙතනින් යවනවා
      />
    </div>
  );
};

export default PrintPage;
