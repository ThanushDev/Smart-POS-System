import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Image as ImageIcon, Loader2, Lock, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const businessId = "BS-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const registrationData = {
      name: formData.get('businessName'),
      address: formData.get('address'),
      whatsapp: formData.get('whatsapp'),
      email: formData.get('email'),
      password: formData.get('password'),
      logo: logo,
      businessId: businessId, 
      role: 'Admin'
    };

    try {
      await axios.post('/api/auth/register', registrationData);
      toast.success("Business Registered!");
      navigate('/');
    } catch (err) { toast.error("Failed"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[500px] bg-white rounded-[3rem] p-10 shadow-xl">
        <h1 className="text-2xl font-black italic uppercase text-center mb-8">Register <span className="text-indigo-600">Shop</span></h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="businessName" type="text" required placeholder="Business Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
          <input name="email" type="email" required placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
          <div className="relative">
            <input name="password" type={showPass ? "text" : "password"} required placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <input name="whatsapp" type="text" placeholder="WhatsApp" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
          <input name="address" type="text" placeholder="City" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
          <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Register;
