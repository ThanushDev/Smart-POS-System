import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';

const Accounts = () => {
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSystemReset = () => {
    localStorage.clear();
    toast.success("System Reset Complete!");
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-black mb-10 italic uppercase">Admin Settings</h1>
        
        <div className="bg-white p-10 rounded-[3rem] border-2 border-rose-100 shadow-sm inline-block">
          <h3 className="text-rose-600 font-bold mb-4">SYSTEM MANAGEMENT</h3>
          <p className="text-slate-500 mb-6">Please use this Button for Erase all data.</p>
          <button onClick={() => setShowResetModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-rose-700 transition-all">SYSTEM RESET</button>
        </div>

        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]">
            <div className="bg-white p-10 rounded-[3rem] w-96 text-center shadow-2xl">
              <h2 className="text-rose-600 font-black text-xl mb-4">CONFIRM RESET?</h2>
              <p className="text-slate-600 mb-8">Are you Sure!</p>
              <div className="flex gap-4">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 font-bold bg-slate-100 rounded-2xl">CANCEL</button>
                <button onClick={handleSystemReset} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black">RESET NOW</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default Accounts;
