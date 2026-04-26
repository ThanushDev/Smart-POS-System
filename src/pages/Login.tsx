import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'User' | 'Admin'>('User');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Backend link eka methanata danna. 
  const API_URL = "https://smart-pos-system-lilac.vercel.app"; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      if (res.data.success) {
        const user = res.data.user;
        if (activeTab === 'Admin' && user.role !== 'Admin') {
          toast.error("Access Denied: Admin only!");
          setIsLoading(false);
          return;
        }
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome back!`);
        navigate(user.role === 'Admin' ? '/dashboard' : '/pos');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 italic">
      <div className="w-full max-w-[450px] bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
          <button onClick={() => setActiveTab('User')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] ${activeTab === 'User' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Staff</button>
          <button onClick={() => setActiveTab('Admin')} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] ${activeTab === 'Admin' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Admin</button>
        </div>
        <h1 className="text-3xl font-black uppercase text-center mb-10 italic">{activeTab} <span className={activeTab === 'Admin' ? 'text-rose-600' : 'text-indigo-600'}>Portal</span></h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input name="username" type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 outline-none font-bold text-sm focus:ring-2 ring-indigo-50" placeholder="Email Address" />
          </div>
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-16 pr-14 py-5 rounded-2xl bg-slate-50 outline-none font-bold text-sm focus:ring-2 ring-indigo-50" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-5 text-white rounded-[2rem] font-black uppercase text-sm shadow-xl ${activeTab === 'Admin' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
