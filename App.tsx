import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages Import (Folder structure එකට අනුව නිවැරදි කර ඇත)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewBill from './pages/NewBill';
import Inventory from './pages/Inventory';
import Invoice from './pages/Invoice';
import Report from './pages/Report';
import Accounts from './pages/Accounts';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Theme appearance="light" accentColor="indigo" radius="large">
      <Router>
        <main className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main Application Routes (Sidebar එකේ ඇති කැපිටල් අකුරුවලට ගැලපෙන සේ සකස් කළා) */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/NewBill" element={<NewBill />} />
            <Route path="/Inventory" element={<Inventory />} />
            <Route path="/Invoices" element={<Invoice />} /> {/* Sidebar එකේ 'Invoices' ලෙස ඇති නිසා */}
            <Route path="/report" element={<Report />} />
            <Route path="/accounts" element={<Accounts />} />

            {/* Error Handling */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </main>
      </Router>
    </Theme>
  );
}

export default App;
