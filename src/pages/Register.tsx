import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Info, Image as ImageIcon, Loader2, Mail, Lock, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Logo එක Preview කිරීම සහ Base64 බවට පත් කිරීම
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Logo size should be less than 2MB");
        return;
      }
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
    
    // API එකට යවන JSON object එක
    const registrationData = {
      businessName: formData.get('businessName'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email'),
      password: formData.get('password'),
      logo: logo,
      role: 'Admin' 
    };

    try {
      // Backend Endpoint එකට දත්ත යැවීම
      const res = await axios.post('/api/auth/register', registrationData);
      
      if (res.data.success) {
        toast.success("Account Created Successfully!");
        // සාර්ථක නම් විනාඩි 2කින් පසු Login වෙත යොමු කරයි
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err: any) {
      // Server එකෙන් එන නියම Error එක පෙන්වීම
      const errorMsg = err.response?.data?.message || "Connection error. Please try again.";
      toast.error(errorMsg);
      console.error("Registration Error Details:", err.response?.data);
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

      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 p-8 md:p-12">
          <header className="mb-10 text-center md:text-left">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-100 mx-auto md:mx-0">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Setup Business</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Create your Digi Solutions Admin account</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload Section */}
            <div className="flex justify-center md:justify-start mb-6">
              <label className="relative w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden group">
                {logo ? (
                  <img src={logo} alt="Business Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="text-slate-300 group-hover:text-indigo-400" size={24} />
                    <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Logo</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              <div className="ml-4 flex flex-col justify-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Business Logo</p>
                 <p className="text-[8px] text-slate-300">Recommended: Square PNG</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Store className="absolute left-4 top-4 text-slate-300" size={18} />
                <input name="businessName" type="text" required placeholder="Business Name" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                <input name="whatsapp" type="text" required placeholder="WhatsApp No" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all" />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
              <input name="email" type="email" required placeholder="Email Address" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all" />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
              <input name="password" type="password" required placeholder="Admin Password" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-all" />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Complete Registration <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase">
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
