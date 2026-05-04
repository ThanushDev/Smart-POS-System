import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PrintableBill from '../components/PrintableBill'; // ඔයාගේ දැනට තියෙන component එක

const PrintPage = () => {
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      axios.get(`/api/invoices/single/${id}`)
        .then(res => {
          setInvoiceData(res.data);
          // දත්ත ලැබුණු ගමන් Print Dialog එක Open කරන්න
          setTimeout(() => window.print(), 1000);
        });
    }
  }, []);

  if (!invoiceData) return <div className="p-10 text-center font-bold">Fetching Bill from MongoDB...</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* ඔයාගේ PrintableBill component එකට data ටික pass කරනවා */}
      <PrintableBill 
        cart={invoiceData.items} 
        total={invoiceData.total} 
        invoiceId={invoiceData.invoiceId} 
        date={invoiceData.date}
        cashier={invoiceData.cashier}
      />
    </div>
  );
};

export default PrintPage;
