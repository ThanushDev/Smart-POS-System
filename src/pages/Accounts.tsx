import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, UserCheck, Shield, Edit3, XCircle, Save } from 'lucide-react';

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { toast.error("Failed to load users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Form එක Submit කරන එක (Add හෝ Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update Logic
        await axios.put(`/api/users/${editingId}`, newUser);
        toast.success("User Updated Successfully");
      } else {
        // Add Logic
        await axios.post('/api/users/add', newUser);
        toast.success("Staff Account Created");
      }
      resetForm();
      fetchUsers();
    } catch (err) { toast.error("Process failed. Email might be taken."); }
  };

  // Edit කරන්න data ටික form එකට ගැනීම
  const startEdit = (user: any) => {
    setEditingId(user._id);
    setNewUser({ 
      name: user.name, 
      email: user.email, 
      password: user.password, 
      role: user.role 
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewUser({ name: '', email: '', password: '', role: 'Staff' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
      <h1 className="text-3xl font-black uppercase italic">Control <span className="text-indigo-600">Panel</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORM SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
            {editingId ? <Edit3 size={16} className="text-amber-500"/> : <UserPlus size={16}/>} 
            {editingId ? "Edit Member" : "Register Member"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" required value={newUser.name} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e)=>setNewUser({...newUser, name: e.target.value})} />
            <input type="email" placeholder="Email" required value={newUser.email} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e)=>setNewUser({...newUser, email: e.target.value})} />
            <input type="password" placeholder="Password" required value={newUser.password} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e)=>setNewUser({...newUser, password: e.target.value})} />
            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})}>
              <option value="Staff">Staff Member</option>
              <option value="Admin">System Admin</option>
            </select>
            
            <div className="flex gap-2">
              <button type="submit" className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {editingId ? "Update Data" : "Create Account"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="p-4 bg-slate-100 text-slate-500 rounded-2xl">
                  <XCircle size={20}/>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST SECTION */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><UserCheck size={16}/> Team Members</h2>
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {u.role === 'Admin' ? <Shield size={18}/> : <UserPlus size={18}/>}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase text-xs">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{u.email} • <span className="uppercase text-indigo-500">{u.role}</span></p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => startEdit(u)} className="text-amber-500 p-2 hover:bg-amber-50 rounded-xl transition-all">
                    <Edit3 size={18} />
                  </button>
                  {u.role !== 'Admin' && (
                    <button onClick={async () => { if(confirm("Delete this user?")) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); } }} className="text-rose-400 p-2 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
