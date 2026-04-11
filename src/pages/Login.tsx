import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LogIn, User, Lock, ShieldCheck, Loader2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'User' | 'Admin'>('User');
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
        
        if (activeTab === 'Admin' && user.role !== 'Admin') {
          toast.error("Access Denied: You are not an Admin!");
          setIsLoading(false);
          return;
        }

        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome, ${user.name}!`);

        // මෙතන තමයි Redirect logic එක තියෙන්නේ
        if (user.role === 'Admin') {
          navigate('/dashboard');
        } else {
          navigate('/new-bill'); // Staff කෙලින්ම Shop (New Bill) එකට
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
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
        <div className="flex bg-slate-100 p-2 m-6 rounded-2xl">
          <button onClick={() => setActiveTab('User')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'User' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><User size={16} /> Staff Login</button>
          <button onClick={() => setActiveTab('Admin')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'Admin' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}`}><ShieldCheck size={16} /> Admin Login</button>
        </div>

        <div className="px-10 pb-12">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-black italic uppercase text-slate-800">{activeTab === 'Admin' ? 'Admin' : 'Staff'} <span className={activeTab === 'Admin' ? 'text-rose-600' : 'text-indigo-600'}>Portal</span></h1>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <input name="username" type="text" required value={formData.username} onChange={handleInputChange} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="Email Address" />
            <input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold" placeholder="••••••••" />
            <button type="submit" disabled={isLoading} className={`w-full py-5 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all ${activeTab === 'Admin' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Sign In"}
            </button>
          </form>

          {activeTab === 'Admin' && (
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <button onClick={() => navigate('/register')} className="inline-flex items-center gap-2 text-rose-600 font-black text-xs uppercase hover:underline"><UserPlus size={16} /> Create Business Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
