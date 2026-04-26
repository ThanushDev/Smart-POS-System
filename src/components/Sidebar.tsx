import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, UserCircle, LogOut, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'New Bill', path: '/pos' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: FileText, label: 'Invoice', path: '/invoice' },
    { icon: TrendingUp, label: 'Reports', path: '/report' },
    { icon: UserCircle, label: 'Account', path: '/account' },
  ];

  return (
    <aside className=\"w-72 bg-white border-r border-slate-100 flex flex-col p-6 h-screen\">
      <div className=\"mb-10 px-4\">
        <h2 className=\"text-2xl font-black italic text-indigo-600 tracking-tighter\">DIGI <span className=\"text-slate-800\">POS</span></h2>
        <p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-widest\">Business Solutions</p>
      </div>
      <nav className=\"flex-1 space-y-2\">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={20} /> {item.label}
            </div>
          </Link>
        ))}
      </nav>
      <div className=\"pt-6 border-t border-slate-50\">
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className=\"w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm text-rose-500 hover:bg-rose-50 transition-all\">
          <LogOut size={20} /> LOGOUT
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
