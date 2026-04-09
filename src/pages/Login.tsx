import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn, Lock, User, Terminal, UserPlus } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);

        if (user.role === 'Admin') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/new-bill';
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-t-8 border-indigo-600">
          <div className="p-10">
            <header className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
                <Terminal size={32} />
              </div>
              {/* නම වෙනස් කරන ලදි */}
              <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">
                DIGI SOLUTIONS <span className="text-indigo-600">POS SYSTEM</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Authorized Access Only</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700"
                  required
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700"
                  required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : (
                  <>
                    <LogIn size={20} /> Sign In
                  </>
                )}
              </button>
            </form>

            {/* Register Page එකට යාමට ඇති කොටස */}
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">New to the system?</p>
              <button 
                onClick={() => window.location.href = '/Register'}
                className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase hover:underline decoration-2 underline-offset-4"
              >
                <UserPlus size={16} /> Create Admin Account
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Powered by Digi Solutions Engine v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
