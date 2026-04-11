import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Trash2, Edit3, UserCircle, Save, RefreshCw, Loader2 } from 'lucide-react';

const Accounts = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Staff', image: '' });

  useEffect(() => {
    // FIX: Get user session from LocalStorage
    const sessionData = localStorage.getItem('user');
    if (sessionData) {
      setCurrentUser(JSON.parse(sessionData));
    } else {
      toast.error("Session Error: Please login again.");
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // CRITICAL: Finding the ID that connects to MongoDB Business collection
    const bId = currentUser?.businessId || currentUser?._id;

    if (!bId) {
      toast.error("Session Error: Could not verify your business identity. Please re-login.");
      setLoading(false);
      return;
    }

    const payload = { ...formData, businessId: bId };

    try {
      if (isEditing) {
        if (!payload.password) delete (payload as any).password;
        await axios.put(`/api/users/${selectedUserId}`, payload);
        toast.success("User account updated in MongoDB.");
      } else {
        if (!formData.password) {
          toast.error("Password is required.");
          setLoading(false);
          return;
        }
        await axios.post('/api/users/register', payload);
        toast.success("New user stored in MongoDB.");
      }
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({ name: '', username: '', password: '', role: 'Staff', image: '' });
  };

  const handleEdit = (u: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsEditing(true);
    setSelectedUserId(u._id);
    setFormData({ name: u.name, username: u.username, password: '', role: u.role, image: u.image || '' });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter flex items-center gap-3">
              <UserCircle className="text-indigo-600" size={32} /> User Accounts
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">Manage access for your MongoDB database</p>
          </div>
          <button onClick={fetchUsers} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* REGISTRATION FORM */}
          <div className="lg:col-span-4 h-fit sticky top-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase text-slate-700">
                {isEditing ? 'Update Profile' : 'Add New User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" required 
                  onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
                <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" required 
                  onChange={e => setFormData({...formData, username: e.target.value})} value={formData.username} />
                <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" required={!isEditing}
                  onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
                <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase text-slate-600" value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Staff">Staff Member</option>
                  <option value="Admin">System Administrator</option>
                </select>
                <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} 
                  {isEditing ? 'Update User' : 'Register User'}
                </button>
              </form>
            </div>
          </div>

          {/* USER LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase text-slate-700">Database Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u: any) => (
                  <div key={u._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 uppercase">{u.name[0]}</div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-[10px] truncate w-24">{u.name}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase">@{u.username} • {u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={14} /></button>
                      {u.role !== 'Admin' && (
                        <button onClick={async () => { if(confirm(`Delete ${u.name}?`)) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); toast.info("User deleted from MongoDB."); } }} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accounts;
