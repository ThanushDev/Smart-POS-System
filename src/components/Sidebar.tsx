import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Users, LogOut, ShoppingCart } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', show: true },
    { name: 'New Bill', icon: <ShoppingCart size={20} />, path: '/new-bill', show: true },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', show: true },
    { name: 'Invoices', icon: <Receipt size={20} />, path: '/report', show: true },
    // Admin lata witarak Accounts pennanawa
    { name: 'Accounts', icon: <Users size={20} />, path: '/accounts', show: user.role === 'Admin' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen">
      <div className="p-8">
        <h1 className="text-xl font-black italic uppercase text-slate-800 tracking-tighter">
          DIGI <span className="text-indigo-600">SOLUTIONS</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.filter(item => item.show).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              location.pathname === item.path 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
