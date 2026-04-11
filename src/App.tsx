import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';

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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Login එකේ Redirect කරන Paths මෙන්න */}
          <Route path="/new-bill" element={<NewBill />} /> 
          <Route path="/invoices" element={<Invoice />} />
          
          {/* Sidebar එකේ තියෙන අනිත් Paths */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/report" element={<Report />} />
          <Route path="/accounts" element={<Accounts />} />
          
          {/* Error Handling */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Router>
    </Theme>
  );
}
export default App;
