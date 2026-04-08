import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Store, ArrowRight } from 'lucide-react';

    const Login = () => {
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
              <h1 className="text-3xl font-serif font-bold text-slate-900">Welcome Back</h1>
              <p className="text-slate-500 mt-2">Sign in to manage your business</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email or Username</label>
                  <input 
                    type="text" 
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
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                    Register Business
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default Login;