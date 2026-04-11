import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, ShieldAlert, Trash2, Edit3, Camera, KeyRound, UserCircle, Save, X, RefreshCw, Loader2 } from 'lucide-react';

const Accounts = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'Staff', 
    image: '' 
  });

  useEffect(() => {
    // FIX: Checking multiple keys to ensure session is captured
    const storedData = localStorage.getItem('user') || localStorage.getItem('currentUser') || localStorage.getItem('authUser');
    if (storedData) {
      try {
        const parsedUser = JSON.parse(storedData);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Session parse error");
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // FIX: Retrieve Business ID dynamically
    const businessId = currentUser?.businessId || currentUser?._id;

    if (!businessId) {
      toast.error("Session Error: Please log out and log in again.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      businessId: businessId 
    };

    try {
      if (isEditing) {
        if (!payload.password) delete (payload as any).password;
        await axios.put(`/api/users/${selectedUserId}`, payload);
        toast.success("User profile updated successfully!");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new registration.");
          setLoading(false);
          return;
        }
        await axios.post('/api/users/register', payload);
        toast.success("New staff member registered!");
      }
      
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Action failed. Check if username is already taken.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsEditing(true);
    setSelectedUserId(user._id);
    setFormData({ 
      name: user.name, 
      username: user.username, 
      password: '', 
      role: user.role, 
      image: user.image || '' 
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({ name: '', username: '', password: '', role: 'Staff', image: '' });
  };

  const handleMasterReset = async () => {
    if (!adminPassword) return toast.error("Admin password is required.");
    try {
      const res = await axios.post('/api/auth/verify-admin', { 
        username: currentUser.username, 
        password: adminPassword 
      });

      if (res.data.success) {
        if (confirm("WARNING: This will permanently delete ALL sales, inventory, and account data for this shop. Proceed?")) {
          await axios.post('/api/system/reset-shop', { businessId: currentUser?.businessId || currentUser?._id });
          localStorage.clear();
          toast.warn("System reset complete.");
          window.location.href = '/register';
        }
      } else {
        toast.error("Invalid Admin credentials.");
      }
    } catch (err) {
      toast.error("Identity verification failed.");
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) return toast.error("Image too large. Max limit is 1MB.");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
      reader.readAsDataURL(file);
    }
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
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Create and Manage Staff Access</p>
          </div>
          <button onClick={fetchUsers} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* REGISTRATION FORM */}
          <div className="lg:col-span-4 h-fit sticky top-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase flex items-center gap-2 text-slate-700">
                {isEditing ? <Edit3 size={20} className="text-amber-500"/> : <UserPlus size={20} className="text-indigo-600"/>} 
                {isEditing ? 'Update User' : 'Register Staff'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 bg-slate-50 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl group">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                        <UserCircle className="w-12 h-12 text-indigo-200" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="text-white" size={20} />
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" required 
                    onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
                  
                  <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" required 
                    onChange={e => setFormData({...formData, username: e.target.value})} value={formData.username} />
                  
                  <input type="password" placeholder={isEditing ? "New Password (Optional)" : "Password"} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm" required={!isEditing}
                    onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
                  
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase text-slate-600" value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Staff">Staff Member</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                  )}
                  <button disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> {isEditing ? 'Save Changes' : 'Create Account'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* USER LIST */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase text-slate-700">System Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u: any) => (
                  <div key={u._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden shadow-sm border-2 border-slate-100 flex items-center justify-center">
                        {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <span className="font-black text-indigo-600 uppercase">{u.name[0]}</span>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-slate-800 uppercase text-[10px] truncate w-28">{u.name}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase">@{u.username} • {u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button title="Edit" onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={14} /></button>
                      {u.role !== 'Admin' && (
                        <button title="Delete" onClick={async () => { if(confirm(`Delete ${u.name}?`)) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); toast.info("User deleted."); } }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-rose-50 p-8 rounded-[3rem] border-2 border-rose-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-lg font-black italic uppercase text-rose-600 flex items-center gap-2 mb-1">
                  <ShieldAlert size={20} /> Master Data Reset
                </h2>
                <p className="text-rose-400 text-[10px] font-bold uppercase opacity-80 italic">Permanently wipe all shop business data.</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-200">
                Wipe All Data
              </button>
            </div>
          </div>

        </div>

        {/* RESET MODAL */}
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-sm text-center shadow-2xl">
              <KeyRound className="mx-auto text-rose-600 mb-4" size={40} />
              <h2 className="font-black text-xl mb-2 uppercase italic text-slate-800">Admin Authentication</h2>
              <input type="password" placeholder="ENTER PASSWORD" className="w-full p-4 bg-slate-100 rounded-2xl mb-6 outline-none border-2 border-transparent focus:border-rose-600 text-center font-black"
                onChange={(e) => setAdminPassword(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 font-black bg-slate-100 rounded-2xl text-slate-400 uppercase text-[10px]">Cancel</button>
                <button onClick={handleMasterReset} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px]">Reset Now</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Accounts;
