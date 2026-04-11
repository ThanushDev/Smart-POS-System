import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NewBill from '@/pages/NewBill';
import Inventory from '@/pages/Inventory';
import Invoice from '@/pages/Invoice'; 
import Report from '@/pages/Report';
import Accounts from '@/pages/Accounts';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  return (
    <Theme appearance="light" accentColor="indigo" radius="large">
      <Router>
        <main className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Sidebar එකේ තියෙන පරණ Paths වලට මෙතන Names Fix කළා */}
            <Route path="/pos" element={<NewBill />} /> 
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/report" element={<Report />} />
            
            <Route 
              path="/account" 
              element={user?.role === 'Admin' ? <Accounts /> : <Navigate to="/dashboard" replace />} 
            />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
        </main>
      </Router>
    </Theme>
  );
}

export default App;
