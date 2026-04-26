import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit3, Eye, EyeOff, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/users?businessId=${currentUser.businessId}`);
      setUsers(res.data);
    } catch (err) { toast.error("Load failed"); }
  };

  useEffect(() => { if(currentUser.businessId) fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { ...newUser, businessId: currentUser.businessId };
      await axios.post('/api/users/add', userData);
      toast.success("Staff added!");
      setNewUser({ name: '', email: '', password: '', role: 'Staff' });
      fetchUsers();
    } catch (err) { toast.error("Failed to add user"); }
  };

  const handleDeleteBusiness = async () => {
    setIsDeleting(true);
    try {
      await axios.post('/api/auth/delete-business', { businessId: currentUser.businessId, password: confirmPassword, adminId: currentUser._id });
      localStorage.clear(); navigate('/');
    } catch (err) { toast.error("Incorrect password"); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-black italic uppercase mb-6 text-slate-800 tracking-tighter">Shop <span className="text-indigo-600">Users</span></h1>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u._id} className="text-sm font-bold uppercase italic">
                    <td className="px-6 py-4">{u.name}<br/><span className="text-[10px] text-slate-300 lowercase">{u.email}</span></td>
                    <td className="px-6 py-4 text-indigo-600 text-[10px]">{u.role}</td>
                    <td className="px-6 py-4 text-right"><button className="p-2 text-slate-300"><Edit3 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-[350px] space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100">
            <h2 className="font-black italic uppercase mb-4 flex items-center gap-2"><UserPlus size={18}/> Add Staff</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
              <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Add User</button>
            </form>
          </div>
          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
             <button onClick={() => setIsDeleteModalOpen(true)} className="w-full py-3 bg-white text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest border border-rose-200">Delete Shop</button>
          </div>
        </div>
      </main>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center">
            <Trash2 className="mx-auto text-rose-500 mb-4" size={40}/>
            <h2 className="font-black uppercase italic mb-4">Are you sure?</h2>
            <input type="password" placeholder="Admin Password" className="w-full p-4 bg-slate-50 rounded-xl mb-4 font-bold outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleDeleteBusiness} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px]">{isDeleting ? 'Deleting...' : 'Delete All'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Accounts;
