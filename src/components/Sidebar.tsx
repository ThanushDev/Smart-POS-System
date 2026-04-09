import React, { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    // LocalStorage එකෙන් දැනට Login වී සිටින පරිශීලකයා ලබාගැනීම
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/Dashboard', icon: <LayoutDashboard size={22} />, role: 'staff' },
    { name: 'New Bill', path: '/NewBill', icon: <ShoppingCart size={22} />, role: 'staff' },
    { name: 'Inventory', path: '/Inventory', icon: <Package size={22} />, role: 'staff' },
    { name: 'Invoices', path: '/Invoices', icon: <FileText size={22} />, role: 'staff' },
    // Admin කෙනෙක් නම් පමණක් පෙනෙන Accounts පිටුව
    { name: 'Accounts', path: '/accounts', icon: <Settings size={22} />, role: 'admin' },
  ];

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-sm z-50">
      {/* Branding */}
      <div className="p-10">
        <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200 mb-4">D</div>
        <h1 className="text-xl font-black italic tracking-tighter text-slate-800 leading-none">DIGI SOLUTIONS</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Point of Sale</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-6 space-y-2">
        {menuItems.map((item) => {
          // Role Based Filtering: Admin පිටුව Staff ලාට නොපෙන්වයි
          if (item.role === 'admin' && currentUser.role !== 'admin') return null;

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                isActive 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-8 border-t border-slate-50">
        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl">
          <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-slate-800 truncate uppercase">{currentUser.name || 'User'}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{currentUser.role || 'Staff'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all"
        >
          <LogOut size={20} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
