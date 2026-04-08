import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Store, ArrowRight, Info } from 'lucide-react';

    const Register = () => {
      const navigate = useNavigate();

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard');
      };

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="inline-flex p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
                <Store className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">Register Business</h1>
              <p className="text-slate-500 mt-2">Start your smart POS journey today</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Meku Retail Solutions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                  <div className="mt-2 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <p>The number entered here is what customers in the marketplace can see.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="admin@business.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 group"
                >
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500">
                  Already have an account?{' '}
                  <Link to="/" className="text-indigo-600 font-bold hover:underline">
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