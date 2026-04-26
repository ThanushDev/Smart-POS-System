import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Edit3, User, Eye, EyeOff, X, Search, AlertTriangle, Trash2, Loader2, Lock } from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!currentUser.businessId) return toast.error("Login session expired!");
    try {
      const userData = { ...newUser, businessId: currentUser.businessId };
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, userData);
        toast.success("User updated");
      } else {
        await axios.post('/api/users/add', userData);
        toast.success("Staff account created");
      }
      setNewUser({ name: '', email: '', password: '', role: 'Staff' });
      setEditingId(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to save user"); }
  };

  const handleDeleteBusiness = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.post('/api/auth/delete-business', {
        businessId: currentUser.businessId,
        password: confirmPassword,
        adminId: currentUser._id
      });
      if (res.data.success) {
        toast.success("Shop Deleted Permanently!");
        localStorage.clear();
        navigate('/');
      }
    } catch (err: any) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Shop <span className="text-indigo-600">Accounts</span></h1>
          <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Profile</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Role</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u: any) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm uppercase italic">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-[10px] uppercase">{u.role}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => {setEditingId(u._id); setNewUser(u)}} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full lg:w-[380px] space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
            <h2 className="font-black italic uppercase mb-6 flex items-center gap-2 text-lg"><UserPlus size={20}/> {editingId ? 'Edit' : 'Add'} Staff</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
              <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
              <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
              <select className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg">Save User</button>
            </form>
          </div>

          <div className="bg-rose-50 rounded-[2rem] p-6 border border-rose-100">
            <h3 className="text-rose-600 font-black uppercase italic text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Danger Zone</h3>
            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full py-3 bg-white border border-rose-200 text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all">Delete Entire Shop</button>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center">
            <Trash2 className="mx-auto text-rose-500 mb-4" size={48}/>
            <h2 className="text-xl font-black uppercase italic mb-2">Are you sure?</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-6">Confirm your admin password to delete everything permanently.</p>
            <input type="password" placeholder="Admin Password" className="w-full p-4 bg-slate-50 rounded-xl mb-4 outline-none font-bold text-sm border-2 focus:border-rose-100" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleDeleteBusiness} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-rose-200">{isDeleting ? <Loader2 className="animate-spin mx-auto"/> : 'Delete All'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
