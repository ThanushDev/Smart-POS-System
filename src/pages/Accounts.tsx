import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, Shield, Edit3, User, Eye, EyeOff, X, Search } from 'lucide-react';

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { toast.error("Failed to load users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, newUser);
        toast.success("User updated");
      } else {
        await axios.post('/api/users/add', newUser);
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

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-8">
        {/* Left Side: User List */}
        <div className="flex-1">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Staff <span className="text-indigo-600">Management</span></h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Control your business access</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm outline-none font-bold text-xs focus:ring-2 ring-indigo-100 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className={`hover:bg-slate-50/50 transition-all group ${editingId === u._id ? 'bg-indigo-50/30' : ''}`}>
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
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${u.role === 'Admin' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(u)} className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><Edit3 size={16}/></button>
                        {u.role !== 'Admin' && (
                          <button onClick={async () => { if(confirm("Delete?")) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); } }} className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-all shadow-sm"><Trash2 size={16}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Form (Like NewBill Cart) */}
        <div className="w-[400px] bg-white rounded-[3rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden sticky top-8 h-[calc(100vh-64px)]">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="flex items-center gap-3 font-black uppercase italic tracking-tighter text-xl">
              <UserPlus className="text-indigo-600" /> {editingId ? 'Edit Account' : 'New Staff'}
            </h2>
            {editingId && <button onClick={resetForm} className="text-slate-300 hover:text-rose-500"><X size={20}/></button>}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-5 overflow-y-auto">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
              <input 
                type="text" 
                placeholder="Employee Name" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-100" 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Address</label>
              <input 
                type="email" 
                placeholder="email@business.com" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-100" 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 ring-indigo-100" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Account Role</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer" 
                value={newUser.role} 
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Staff">Staff Member</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </form>

          <div className="p-8 bg-slate-900 text-white rounded-t-[3rem]">
            <button 
              onClick={handleSubmit}
              className={`w-full py-5 ${editingId ? 'bg-amber-500' : 'bg-indigo-600'} hover:opacity-90 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20`}
            >
              {editingId ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accounts;
