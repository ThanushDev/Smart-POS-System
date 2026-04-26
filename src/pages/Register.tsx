import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Image as ImageIcon, Loader2, Lock, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const registrationData = {
      name: formData.get('businessName'),
      address: formData.get('address'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email'),
      password: formData.get('password'),
      logo: logo,
      role: 'Admin' 
    };

    try {
      const res = await axios.post('/api/auth/register', registrationData);
      if (res.data.success) {
        toast.success("Business Account Created Successfully!");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-[550px] bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-indigo-100 border border-slate-100">
        
        <header className="text-center mb-10">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Store size={32} />
             </div>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Register <span className="text-indigo-600">Business</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Start your digital journey today</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center mb-6">
            <label className="relative w-24 h-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden group">
              {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300 group-hover:text-indigo-400" size={28} />}
              <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
            </label>
            <p className="text-[10px] font-black uppercase text-slate-400 mt-3 tracking-widest">Upload Business Logo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input name="businessName" type="text" required placeholder="Business Name" className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50" />
            </div>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input name="whatsapp" type="text" required placeholder="WhatsApp No" className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50" />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input name="address" type="text" required placeholder="City / Address" className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50" />
          </div>

          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input name="email" type="email" required placeholder="Admin Email" className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50" />
          </div>

          {/* Password with View/Hide Toggle */}
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="Admin Password" 
              className="w-full pl-14 pr-14 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-50" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                Register Business <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            Already have an account? <Link to="/" className="text-indigo-600 hover:underline ml-2">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
