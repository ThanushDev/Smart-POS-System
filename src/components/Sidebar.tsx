import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, UserCircle, LogOut, TrendingUp, Menu, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'New Bill', path: '/pos' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: FileText, label: 'Invoice', path: '/invoice' },
    { icon: TrendingUp, label: 'Reports', path: '/report' },
    { icon: UserCircle, label: 'Account', path: '/account' },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-10 px-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic text-indigo-600 tracking-tighter">DIGI <span className="text-slate-800">POS</span></h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Solutions</p>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="block" onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}>
                <item.icon size={20} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-slate-50">
        <div className="bg-slate-50 p-4 rounded-2xl mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Active User</p>
          <p className="text-sm font-black text-slate-800 italic uppercase">{user.name || 'Admin'}</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm text-rose-500 hover:bg-rose-50 transition-all">
          <LogOut size={20} /> LOGOUT
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-xl font-black italic text-indigo-600 tracking-tighter">DIGI <span className="text-slate-800">POS</span></h2>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-500 p-2 rounded-xl bg-slate-50">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-72 bg-white flex flex-col p-6 h-full overflow-y-auto">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col p-6 h-screen flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
