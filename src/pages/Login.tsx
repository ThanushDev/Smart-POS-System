import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn, User, Lock, Terminal, UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Backend එකට දත්ත යැවීම
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        const user = res.data.user;
        
        // පරණ දත්ත clear කර අලුත් 'user' දත්ත ඇතුළත් කිරීම
        // Sidebar එකේ දත්ත පෙන්වීමට මෙම 'user' කියන key එකම භාවිතා කළ යුතුයි
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Welcome back, ${user.name}!`);

        // Navigation logic
        // ඔයාගේ Routes වල Dashboard එක පටන් ගන්නේ Capital 'D' අකුරෙන් නම් එය එලෙසම තිබිය යුතුයි
        if (user.role === 'Admin') {
          navigate('/Dashboard');
        } else {
          navigate('/NewBill');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Login failed. Check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
        <div className="p-10 md:p-12">
          <header className="mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-100 mx-auto rotate-3">
              <Terminal size={40} />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">
              Digi <span className="text-indigo-600">POS</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic">Advanced Business Engine</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                name="username"
                type="text" 
                required 
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all placeholder:text-slate-300"
                placeholder="Username or Email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                name="password"
                type="password" 
                required 
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <><LogIn size={20} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">New to the system?</p>
            <button 
              type="button"
              onClick={() => navigate('/register')} 
              className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase hover:underline"
            >
              <UserPlus size={16} /> Create Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
