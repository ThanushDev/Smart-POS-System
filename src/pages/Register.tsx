import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
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
    
    // Backend එකට ඕන විදියට data structure එක හැදුවා
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
        toast.success("Business Account Created!");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 p-10 border border-slate-100">
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black italic text-slate-800 tracking-tighter uppercase">Register <span className="text-indigo-600">Business</span></h1>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Setup your professional POS system</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <label className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400 transition-colors">
              {logo ? <img src={logo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
              <input type="file" className="hidden" onChange={handleLogoUpload} />
            </label>
            <p className="text-[10px] font-black uppercase text-slate-400">Upload Business Logo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="businessName" type="text" required placeholder="Business Name" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
            <input name="whatsapp" type="text" required placeholder="WhatsApp No" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
          </div>
          <input name="address" type="text" required placeholder="City / Address" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
          <input name="email" type="email" required placeholder="Admin Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />
          <input name="password" type="password" required placeholder="Admin Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" />

          <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
            {isLoading ? <Loader2 className="animate-spin" /> : <>Register Business <ArrowRight size={18}/></>}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Already have an account? <Link to="/" className="text-indigo-600 underline">Sign In</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
