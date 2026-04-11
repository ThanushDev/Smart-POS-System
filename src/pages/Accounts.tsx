import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, UserCheck, Shield, Edit3, XCircle, User } from 'lucide-react';

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
    } catch (err) { toast.error("Failed"); }
  };

  const startEdit = (user: any) => {
    setEditingId(user._id);
    setNewUser({ name: user.name, email: user.email, password: user.password, role: user.role });
  };

  const resetForm = () => {
    setEditingId(null);
    setNewUser({ name: '', email: '', password: '', role: 'Staff' });
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-black uppercase italic text-slate-800">Control <span className="text-indigo-600">Panel</span></h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" value={newUser.name} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            <input type="email" placeholder="Email" value={newUser.email} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={newUser.password} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase">{editingId ? "Update" : "Create"}</button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border">
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                    {u.role === 'Admin' ? <Shield size={18} /> : <User size={18} />}
                  </div>
                  <div><p className="font-black text-xs uppercase">{u.name}</p><p className="text-[10px] text-slate-400">{u.email}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(u)} className="text-amber-500"><Edit3 size={18} /></button>
                  {u.role !== 'Admin' && <button onClick={async () => { if(confirm("Delete?")) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); } }} className="text-rose-400"><Trash2 size={18} /></button>}
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
