import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { 
      LayoutDashboard, 
      PlusSquare, 
      Package, 
      FileText, 
      BarChart3, 
      Users, 
      LogOut,
      Store
    } from 'lucide-react';

    const Sidebar = () => {
      const location = useLocation();
      const businessName = "Meku Retail Solutions";

      const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PlusSquare, label: 'New Bill', path: '/new-bill' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: FileText, label: 'Invoice', path: '/invoice' },
        { icon: BarChart3, label: 'Report', path: '/report' },
      ];

      const isActive = (path: string) => location.pathname === path;

      return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Store className="text-white" size={20} />
              </div>
              <h1 className="font-serif font-bold text-xl text-slate-900 truncate">
                {businessName}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} 
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-1">
            <Link
              to="/accounts"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/accounts')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users size={20} className={isActive('/accounts') ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="font-medium">Accounts</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-200">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>
      );
    };

    export default Sidebar;