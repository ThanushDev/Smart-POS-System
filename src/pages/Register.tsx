import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Info, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    // API එකට යවන දත්ත සැකසීම
    const registrationData = {
      businessName: formData.get('businessName'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email'),
      password: formData.get('password'),
      logo: logo,
      role: 'Admin' // පළමු පරිශීලකයා සැමවිටම Admin වේ
    };

    try {
      // 1. MongoDB Database එකට දත්ත යැවීම (API Call)
      const res = await axios.post('/api/auth/register', registrationData);

      if (res.data.success) {
        // 2. සාර්ථක නම් LocalStorage එකේ තාවකාලිකව තබා ගැනීම (Auto-login සඳහා)
        localStorage.setItem('currentUser', JSON.stringify(res.data.user));
        localStorage.setItem('businessInfo', JSON.stringify(res.data.business));
        
        toast.success("Registration Successful!");
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter">
            REGISTER <span className="text-indigo-600">POS SYSTEM</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Start your smart POS journey today</p>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload Section */}
            <div className="flex flex-col items-center mb-4">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all overflow-hidden bg-slate-50">
                  {logo ? (
                    <img src={logo} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="mb-1" />
                      <span className="text-[10px] font-black uppercase">Logo</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Upload Business Logo</p>
            </div>

            {/* Business Name Field */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Business Name</label>
              <input 
                name="businessName"
                type="text" 
                autoComplete="organization"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                placeholder="Digi Solutions"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">WhatsApp Number</label>
              <input 
                name="whatsapp"
                type="tel" 
                autoComplete="tel"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                placeholder="+94 77 123 4567"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">Admin Email</label>
              <input 
                name="email"
                type="email" 
                autoComplete="email"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                placeholder="admin@digi.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-1 tracking-widest">System Password</label>
              <input 
                name="password"
                type="password" 
                autoComplete="new-password"
                required
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase">
              Already have an account?{' '}
              <Link to="/" className="text-indigo-600 font-black hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
