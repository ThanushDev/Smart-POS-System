import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, FileText, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Sidebar = () => {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'POS Terminal', path: '/pos' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: FileText, label: 'Sales Records', path: '/invoices' },
    { icon: UserCircle, label: 'Account', path: '/account' }, // මල්ලි, මේක path: '/account' කරන්න
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 h-screen">
      <div className="mb-10 px-4">
        <h2 className="text-2xl font-black italic text-indigo-600 tracking-tighter">DIGI <span className="text-slate-800">POS</span></h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Solutions</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current User</p>
          <p className="text-sm font-black text-slate-800 italic uppercase">{user.name}</p>
          <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{user.role}</span>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
