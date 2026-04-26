import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Users, LogOut, ShoppingCart, FileText } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', show: true },
    { name: 'New Bill', icon: <ShoppingCart size={20} />, path: '/pos', show: true }, // '/pos' kala
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', show: true },
    { name: 'Invoices', icon: <FileText size={20} />, path: '/invoice', show: true },
    { name: 'Reports', icon: <Receipt size={20} />, path: '/report', show: true },
    { name: 'Accounts', icon: <Users size={20} />, path: '/account', show: user.role === 'Admin' }, // '/account' kala
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen">
      <div className="p-8 font-black italic text-xl">DIGI <span className="text-indigo-600">SOLUTIONS</span></div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.filter(item => item.show).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              location.pathname === item.path ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>
      <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="m-4 p-4 text-rose-500 font-bold flex items-center gap-2">
        <LogOut size={20}/> Logout
      </button>
    </div>
  );
};
export default Sidebar;
