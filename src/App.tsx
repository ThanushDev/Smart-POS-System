import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NewBill from '@/pages/NewBill';
import Inventory from '@/pages/Inventory';
import Invoice from '@/pages/Invoice'; 
import Accounts from '@/pages/Accounts';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Theme appearance="light" accentColor="indigo" radius="large">
      <Router>
        <main className="min-h-screen">
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Common (දෙන්නටම පුළුවන්) */}
            <Route path="/new-bill" element={<NewBill />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/invoices" element={<Invoice />} />
            
            {/* Admin Only - Admin නොවුනොත් auto-redirect වෙන්නේ Shop (new-bill) එකටයි */}
            <Route path="/dashboard" element={user.role === 'Admin' ? <Dashboard /> : <Navigate to="/new-bill" />} />
            <Route path="/accounts" element={user.role === 'Admin' ? <Accounts /> : <Navigate to="/new-bill" />} />
            
            {/* 404 */}
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
