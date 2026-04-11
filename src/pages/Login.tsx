import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn, User, Lock, Terminal, UserPlus, Loader2, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'User' | 'Admin'>('User'); // මුලින්ම User පෙන්වයි
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        const user = res.data.user;
        
        // Role එක check කිරීම (Admin mode එකේදී අනිවාර්යයෙන් Admin වෙන්න ඕනේ)
        if (activeTab === 'Admin' && user.role !== 'Admin') {
          toast.error("Access Denied: You are not an Admin!");
          setIsLoading(false);
          return;
        }

        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome, ${user.name}!`);

        if (user.role === 'Admin') {
          navigate('/Dashboard');
        } else {
          navigate('/NewBill');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed.");
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
        {/* Toggle Bar */}
        <div className="flex bg-slate-100 p-2 m-6 rounded-2xl">
          <button 
            onClick={() => setActiveTab('User')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'User' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
          >
            <User size={16} /> Staff Login
          </button>
          <button 
            onClick={() => setActiveTab('Admin')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'Admin' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}`}
          >
            <ShieldCheck size={16} /> Admin Login
          </button>
        </div>

        <div className="px-10 pb-12">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">
              {activeTab === 'Admin' ? 'Admin' : 'Staff'} <span className={activeTab === 'Admin' ? 'text-rose-600' : 'text-indigo-600'}>Portal</span>
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-2 italic">Digi Solutions Engine</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input name="username" type="text" required value={formData.username} onChange={handleInputChange}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold placeholder:text-slate-300"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input name="password" type="password" required value={formData.password} onChange={handleInputChange}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${activeTab === 'Admin' ? 'bg-rose-600 shadow-rose-100 hover:bg-rose-700' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700'}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>

          {/* Admin Mode එකේ විතරක් Signup එක පෙන්වමු */}
          {activeTab === 'Admin' && (
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 text-rose-600 font-black text-xs uppercase hover:underline">
                <UserPlus size={16} /> Create Business Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
