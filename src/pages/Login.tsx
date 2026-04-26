import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'User' | 'Admin'>('User');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        if (activeTab === 'Admin' && user.role !== 'Admin') {
          toast.error("Access Denied: Admin only!");
          setIsLoading(false);
          return;
        }
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome, ${user.name}!`);
        navigate(user.role === 'Admin' ? '/dashboard' : '/pos');
      }
    } catch (err) {
      toast.error("Login Failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[450px] bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100 border border-slate-100">
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full">
            <button onClick={() => setActiveTab('User')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'User' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Staff</button>
            <button onClick={() => setActiveTab('Admin')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'Admin' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Admin</button>
          </div>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{activeTab} <span className={activeTab === 'Admin' ? 'text-rose-600' : 'text-indigo-600'}>Portal</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Sign in to your dashboard</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input name="username" type="text" required value={formData.username} onChange={handleInputChange} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 ring-indigo-50" placeholder="Email Address" />
          </div>

          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleInputChange} className="w-full pl-16 pr-14 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 ring-indigo-50" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all ${activeTab === 'Admin' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Sign In"}
          </button>
        </form>

        {activeTab === 'Admin' && (
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/register')} className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline">Register New Business</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
