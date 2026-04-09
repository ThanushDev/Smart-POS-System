import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// '@' භාවිතා කර src/pages වෙත යොමු කිරීම
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
  return (
    <Theme appearance="light" accentColor="indigo" radius="large">
      <Router>
        <main className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Sidebar එකේ links වලට ගැලපෙන සේ path සකසා ඇත */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/NewBill" element={<NewBill />} />
            <Route path="/Inventory" element={<Inventory />} />
            <Route path="/Invoices" element={<Invoice />} />
            
            <Route path="/report" element={<Report />} />
            <Route path="/accounts" element={<Accounts />} />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="light"
          />
        </main>
      </Router>
    </Theme>
  );
}

export default App;
