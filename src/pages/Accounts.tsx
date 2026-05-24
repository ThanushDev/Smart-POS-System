import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit3, Eye, EyeOff, Trash2, X } from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [showPass, setShowPass] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/users?businessId=${currentUser.businessId}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { toast.error("Load failed"); }
  };

  useEffect(() => { if(currentUser.businessId) fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, newUser);
        toast.success("Staff updated!");
      } else {
        const userData = { ...newUser, businessId: currentUser.businessId };
        await axios.post('/api/users/add', userData);
        toast.success("Staff added!");
      }
      setNewUser({ name: '', email: '', password: '', role: 'Staff' });
      setEditingId(null);
      setShowAddForm(false);
      fetchUsers();
    } catch (err) { toast.error("Operation failed"); }
  };

  const handleEditClick = (user: any) => {
    setEditingId(user._id);
    setNewUser({ name: user.name, email: user.email, password: user.password || '', role: user.role });
    setShowAddForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success("Staff deleted");
      fetchUsers();
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleDeleteBusiness = async () => {
    setIsDeleting(true);
    try {
      await axios.post('/api/auth/delete-business', { businessId: currentUser.businessId, password: confirmPassword, adminId: currentUser._id });
      localStorage.clear(); navigate('/');
    } catch (err) { toast.error("Incorrect password"); }
    finally { setIsDeleting(false); }
  };

  const AddForm = () => (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-black italic uppercase flex items-center gap-2 text-sm">
          {editingId ? <Edit3 size={16}/> : <UserPlus size={16}/>} 
          {editingId ? "Edit Staff" : "Add Staff"}
        </h2>
        <button onClick={() => { setEditingId(null); setNewUser({name:'', email:'', password:'', role:'Staff'}); setShowAddForm(false); }} className="text-slate-400 hover:text-rose-500">
          <X size={18}/>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Name" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
        <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required/>
        <div className="relative">
          <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-xs" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>
        <button type="submit" className={`w-full py-4 text-white rounded-xl font-black uppercase text-[10px] ${editingId ? 'bg-orange-500' : 'bg-indigo-600'}`}>
          {editingId ? "Update User" : "Add User"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 italic">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <h1 className="text-2xl font-black italic uppercase mb-6 tracking-tighter">Shop <span className="text-indigo-600">Users</span></h1>
        
        {/* Desktop layout */}
        <div className="hidden md:flex gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u: any) => (
                    <tr key={u._id} className="text-sm font-bold uppercase italic hover:bg-slate-50 transition-all">
                      <td className="px-6 py-4">
                        {u.name}<br/>
                        <span className="text-[10px] text-slate-300 lowercase">{u.email}</span>
                      </td>
                      <td className="px-6 py-4 text-indigo-600 text-[10px]">{u.role}</td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button onClick={() => handleEditClick(u)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-[350px] space-y-6">
            <AddForm />
            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full py-3 bg-white text-rose-500 rounded-xl font-black uppercase text-[10px] border border-rose-200 shadow-sm">Delete Shop</button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-4">
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddForm(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
              <UserPlus size={14}/> Add Staff
            </button>
          </div>

          {/* Mobile add/edit form */}
          {showAddForm && <AddForm />}

          {/* Mobile user cards */}
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={(u as any)._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-black text-sm uppercase italic">{(u as any).name}</p>
                  <p className="text-[10px] text-slate-400 lowercase">{(u as any).email}</p>
                  <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">{(u as any).role}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(u)} className="p-2 text-indigo-500 bg-indigo-50 rounded-xl"><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteUser((u as any)._id)} className="p-2 text-rose-500 bg-rose-50 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIsDeleteModalOpen(true)} className="w-full py-3 bg-white text-rose-500 rounded-2xl font-black uppercase text-[10px] border border-rose-200">Delete Shop</button>
        </div>
      </main>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full text-center">
            <h2 className="font-black uppercase italic mb-4">Are you sure?</h2>
            <input type="password" placeholder="Admin Password" className="w-full p-4 bg-slate-50 rounded-xl mb-4 font-bold outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
            <div className="flex gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleDeleteBusiness} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px]">{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Accounts;
