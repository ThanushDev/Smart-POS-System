import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Image as ImageIcon, Loader2, Mail, Lock, Phone, MapPin } from 'lucide-react';
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
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const registrationData = {
      name: formData.get('businessName'), // Backend එකේ name එකට map වේ
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
        toast.success("Business Account Created!");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10">
        <header className="mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4">
            <Store size={30} />
          </div>
          <h1 className="text-3xl font-black uppercase italic text-slate-800">Setup <span className="text-indigo-600">Business</span></h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden">
              {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
              <input type="file" className="hidden" onChange={handleLogoUpload} />
            </label>
            <p className="text-[10px] font-black uppercase text-slate-400">Upload Business Logo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="businessName" type="text" required placeholder="Business Name" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
            <input name="whatsapp" type="text" required placeholder="WhatsApp No" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
          </div>
          <input name="address" type="text" required placeholder="City / Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
          <input name="email" type="email" required placeholder="Admin Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
          <input name="password" type="password" required placeholder="Admin Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />

          <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="animate-spin" /> : <>Register Business <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
