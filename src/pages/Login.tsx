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

  // Backend URL eka mehema set karanna. 
  // Deploy kalama oyaage backend link eka methanata danna (e.g., https://your-api.vercel.app)
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : ''; // Production wala nam empty thiyanna (Relative path)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Kelinma full URL eka use karanna 404 error eka nathi wenna
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      
      if (res.data.success) {
        const user = res.data.user;
        
        if (activeTab === 'Admin' && user.role !== 'Admin') {
          toast.error("Access Denied: Admin only!");
          setIsLoading(false);
          return;
        }
        
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        
        // Navigation logic
        if (user.role === 'Admin') {
          navigate('/dashboard');
        } else {
          navigate('/pos');
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.message || "Login Failed. Check credentials.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 italic font-sans">
      <div className="w-full max-w-[450px] bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-indigo-100 border border-slate-100">
        
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full">
            <button 
              onClick={() => setActiveTab('User')} 
              className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'User' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Staff
            </button>
            <button 
              onClick={() => setActiveTab('Admin')} 
              className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'Admin' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              Admin
            </button>
          </div>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {activeTab} <span className={activeTab === 'Admin' ? 'text-rose-600' : 'text-indigo-600'}>Portal</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">DIGI SOLUTIONS POS SYSTEM</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              name="username" 
              type="text" 
              required 
              value={formData.username} 
              onChange={handleInputChange} 
              className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 ring-indigo-100 transition-all shadow-inner" 
              placeholder="Email Address" 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              value={formData.password} 
              onChange={handleInputChange} 
              className="w-full pl-16 pr-14 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 ring-indigo-100 transition-all shadow-inner" 
              placeholder="••••••••" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-5 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-95 ${activeTab === 'Admin' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Sign In Now"}
          </button>
        </form>

        {activeTab === 'Admin' && (
          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <button 
              onClick={() => navigate('/register')} 
              className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline"
            >
              Register New Business
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
