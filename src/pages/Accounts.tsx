import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, ShieldAlert, Trash2, Edit3, Camera, KeyRound, UserCircle, Save, X } from 'lucide-react';

const Accounts = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // User Management State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'Staff', image: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { console.error("User fetch error"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/users/${selectedUserId}`, formData);
        toast.success("User Updated Successfully!");
      } else {
        await axios.post('/api/users/register', formData);
        toast.success("User Added Successfully!");
      }
      resetForm();
      fetchUsers();
    } catch (err) { toast.error("Action failed. Check details."); }
  };

  const handleEdit = (user: any) => {
    setIsEditing(true);
    setSelectedUserId(user._id);
    setFormData({ name: user.name, username: user.username, password: '', role: user.role, image: user.image || '' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({ name: '', username: '', password: '', role: 'Staff', image: '' });
  };

  const handleMasterReset = async () => {
    try {
      const verify = await axios.post('/api/auth/verify-admin', { 
        username: currentUser.username, 
        password: adminPassword 
      });

      if (verify.data.success) {
        await axios.post('/api/system/reset');
        localStorage.clear();
        toast.warn("System Data Wiped Successfully!");
        window.location.href = '/register';
      } else {
        toast.error("Invalid Admin Password!");
      }
    } catch (err) { toast.error("Verification failed"); }
  };

  // Image upload logic (Base64)
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <UserCircle className="text-indigo-600" /> Account Management
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage staff profiles and system security</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section 1: User Form (Add/Edit) */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black italic mb-6 uppercase flex items-center gap-2 text-slate-700">
              {isEditing ? <Edit3 size={20}/> : <UserPlus size={20}/>} 
              {isEditing ? 'Edit User' : 'Add New User'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 bg-slate-100 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <UserCircle className="w-full h-full text-slate-300" />
                  )}
                  <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer text-white shadow-lg">
                    <Camera size={14} />
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Upload Profile Picture</p>
              </div>

              <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" required 
                onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
              
              <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" required 
                onChange={e => setFormData({...formData, username: e.target.value})} value={formData.username} />
              
              <input type="password" placeholder={isEditing ? "New Password (Optional)" : "Password"} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold" required={!isEditing}
                onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
              
              <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Staff">Staff Member</option>
                <option value="Admin">System Administrator</option>
              </select>

              <div className="flex gap-2 pt-4">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                )}
                <button className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  <Save size={16} /> {isEditing ? 'Update Profile' : 'Register User'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: User List */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <h2 className="text-xl font-black italic mb-6 uppercase text-slate-700">System Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u: any) => (
                  <div key={u._id} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 overflow-hidden border-2 border-white">
                        {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-indigo-600">{u.name[0]}</div>}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-xs">{u.name}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase">{u.role} • @{u.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"><Edit3 size={16} /></button>
                      {u.role !== 'Admin' && (
                        <button onClick={async () => { if(confirm("Delete user?")) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); } }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Reset Zone */}
            <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-rose-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-black italic uppercase text-rose-600 flex items-center gap-2 mb-2">
                  <ShieldAlert /> Danger Zone
                </h2>
                <p className="text-slate-600 text-xs font-bold uppercase opacity-60">Master system reset will wipe all data permanently</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-200">
                Reset System
              </button>
            </div>
          </div>
        </div>

        {/* Secure Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center">
              <KeyRound className="mx-auto text-rose-600 mb-4" size={48} />
              <h2 className="font-black text-xl mb-2 uppercase italic text-slate-800 tracking-tighter">Confirm Identity</h2>
              <p className="text-slate-500 text-[10px] mb-8 font-black uppercase tracking-widest">Enter Admin Password to continue reset</p>
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-slate-100 rounded-2xl mb-6 outline-none border-2 border-transparent focus:border-rose-600 text-center font-bold"
                onChange={(e) => setAdminPassword(e.target.value)} />
              <div className="flex gap-4">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 font-black bg-slate-100 rounded-2xl text-slate-400 uppercase text-xs">Back</button>
                <button onClick={handleMasterReset} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs">Reset Now</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Accounts;
