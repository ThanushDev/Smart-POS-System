import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Shield, Edit3, User, Eye, EyeOff, X, Search, AlertTriangle, Trash2, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Accounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Business Logic States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/users?businessId=${currentUser.businessId}`);
      setUsers(res.data);
    } catch (err) { toast.error("Failed to load users"); }
  };

  useEffect(() => { if(currentUser.businessId) fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { ...newUser, businessId: currentUser.businessId };
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, userData);
        toast.success("User updated");
      } else {
        await axios.post('/api/users/add', userData);
        toast.success("Staff account created");
      }
      resetForm();
      fetchUsers();
    } catch (err) { toast.error("Failed to save user"); }
  };

  const startEdit = (user: any) => {
    setEditingId(user._id);
    setNewUser({ name: user.name, email: user.email, password: user.password, role: user.role });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewUser({ name: '', email: '', password: '', role: 'Staff' });
    setShowPassword(false);
  };

  // --- සම්පූර්ණ Account එකම මකා දැමීමේ Logic එක ---
  const handleDeleteBusiness = async () => {
    if (!confirmPassword) return toast.warn("Please enter your password to confirm");
    
    setIsDeleting(true);
    try {
      // Backend එකට Password එක සහ Business ID එක යවනවා
      const res = await axios.post('/api/auth/delete-business', {
        businessId: currentUser.businessId,
        password: confirmPassword,
        adminId: currentUser._id
      });

      if (res.data.success) {
        toast.success("Business Account and all data deleted permanentally.");
        localStorage.clear();
        navigate('/'); // Login එකට රීඩිරෙක්ට් කරනවා
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Incorrect password or error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Staff List */}
        <div className="flex-1">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Shop <span className="text-indigo-600">Accounts</span></h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-[0.2em]">Business ID: {currentUser.businessId}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search staff..." className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm outline-none font-bold text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </header>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">User Profile</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.role === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {u.role === 'Admin' ? <Shield size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase italic tracking-tighter">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${u.role === 'Admin' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => startEdit(u)} className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Edit3 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Control Panel (Like NewBill Cart) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 sticky top-8 h-fit">
          
          {/* User Form */}
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="flex items-center gap-3 font-black uppercase italic tracking-tighter text-xl">
                <UserPlus className="text-indigo-600" /> {editingId ? 'Edit User' : 'Add Staff'}
              </h2>
              {editingId && <button onClick={resetForm} className="text-slate-300 hover:text-rose-500"><X size={20}/></button>}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required />
              <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
              
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                <option value="Staff">Staff Member</option>
                <option value="Admin">Co-Admin</option>
              </select>
              
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 mt-2">
                {editingId ? 'Update Account' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Danger Zone: Delete Business */}
          <div className="bg-rose-50/50 rounded-[2.5rem] border border-rose-100 p-8">
             <h3 className="flex items-center gap-2 text-rose-600 font-black uppercase italic tracking-tighter mb-2">
                <AlertTriangle size={18} /> Danger Zone
             </h3>
             <p className="text-[10px] text-rose-400 font-bold uppercase mb-4">Delete your entire shop, products, and sales data permanently.</p>
             <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-4 border-2 border-rose-200 text-rose-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
             >
                Delete Business Account
             </button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Are you sure?</h2>
              <p className="text-slate-400 text-xs font-bold uppercase leading-relaxed">
                This will delete <span className="text-rose-600">everything</span>. Products, Invoices, and Staff. This action is irreversible.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Enter Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type={showConfirmPass ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-rose-100"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-600"
                  >
                    {showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={handleDeleteBusiness}
                  className="flex-2 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete Everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
