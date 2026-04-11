import React, { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, UserCircle, Terminal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  // මූලික menu items ටික
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} />, adminOnly: true },
    { name: 'New Bill', path: '/new-bill', icon: <ShoppingCart size={22} />, adminOnly: false }, 
    { name: 'Inventory', path: '/inventory', icon: <Package size={22} />, adminOnly: false },
    { name: 'Invoices', path: '/invoices', icon: <FileText size={22} />, adminOnly: false },
    { name: 'Accounts', path: '/accounts', icon: <Settings size={22} />, adminOnly: true },
  ];

  // Role එක අනුව filter කිරීම
  const filteredMenu = menuItems.filter(item => !item.adminOnly || user.role === 'Admin');

  return (
    <aside className="w-72 bg-white h-screen flex flex-col border-r border-slate-100 shadow-sm z-50 sticky top-0">
      <div className="p-10">
        <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg mb-4 rotate-3">
          <Terminal size={24} />
        </div>
        <h1 className="text-xl font-black italic tracking-tighter text-slate-800 leading-none uppercase">DIGI <span className="text-indigo-600">POS</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Business Engine</p>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-indigo-500'}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><UserCircle size={24} /></div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-black text-slate-800 truncate uppercase">{user.name || 'User'}</p>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">{user.role || 'Access'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[11px] tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
          <LogOut size={18} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
