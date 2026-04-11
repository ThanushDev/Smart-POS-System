import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, ShieldX, UserCheck } from 'lucide-react';

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });

  const fetchUsers = async () => {
    const res = await axios.get('/api/users');
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/add', newUser);
      toast.success("User Added Successfully");
      setNewUser({ name: '', email: '', password: '', role: 'Staff' });
      fetchUsers();
    } catch (err) { toast.error("Error adding user"); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase italic italic">Control <span className="text-indigo-600">Panel</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE: Add New User Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <UserPlus size={18} /> Register Staff
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <input type="text" placeholder="Full Name" required value={newUser.name} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setNewUser({...newUser, name: e.target.value})} />
            <input type="email" placeholder="Email Address" required value={newUser.email} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setNewUser({...newUser, email: e.target.value})} />
            <input type="password" placeholder="Set Password" required value={newUser.password} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setNewUser({...newUser, password: e.target.value})} />
            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e)=>setNewUser({...newUser, role: e.target.value})}>
              <option value="Staff">Staff Member</option>
              <option value="Admin">System Admin</option>
            </select>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Add Account</button>
          </form>
        </div>

        {/* RIGHT SIDE: Users List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <UserCheck size={18} /> Active Members
          </h2>
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                <div>
                  <p className="font-black text-slate-800 uppercase text-xs tracking-tighter">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{u.email} • <span className="text-indigo-500 italic uppercase">{u.role}</span></p>
                </div>
                {u.role !== 'Admin' && (
                  <button onClick={async () => { if(window.confirm("Remove?")) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); } }} className="text-rose-400 p-2 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
