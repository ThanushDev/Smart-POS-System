import React from 'react';
    import '@radix-ui/themes/styles.css';
    import { Theme } from '@radix-ui/themes';
    import { ToastContainer } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

    import Login from './src/pages/Login';
    import Register from './src/pages/Register';
    import Dashboard from './src/pages/Dashboard';
    import NewBill from './src/pages/NewBill';
    import Inventory from './src/pages/Inventory';
    import Invoice from './src/pages/Invoice';
    import Report from './src/pages/Report';
    import Accounts from './src/pages/Accounts';
    import NotFound from './src/pages/NotFound';

    const App: React.FC = () => {
      return (
        <Theme appearance="light" accentColor="indigo" radius="large">
          <Router>
            <main className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/new-bill" element={<NewBill />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoice" element={<Invoice />} />
                <Route path="/report" element={<Report />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
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