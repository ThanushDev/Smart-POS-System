import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages (ඔබේ src/pages folder එකේ ඇති පරිදි)
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
            {/* 1. ආරම්භක පිටුව (Login) */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 2. ප්‍රධාන යෙදුමේ පිටු (Sidebar එකේ ඇති කැපිටල් අකුරු සහිත Paths වලට ගැලපෙන සේ) */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/NewBill" element={<NewBill />} />
            <Route path="/Inventory" element={<Inventory />} />
            <Route path="/Invoices" element={<Invoice />} />
            
            {/* 3. අනෙකුත් පිටු */}
            <Route path="/report" element={<Report />} />
            <Route path="/accounts" element={<Accounts />} />

            {/* 4. වැරදි Path එකක් ආවොත් 404 වෙත යොමු කිරීම */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          {/* Toast පණිවිඩ පෙන්වීමට */}
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
