import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, ShieldAlert, Trash2, Edit3, Camera, KeyRound, UserCircle, Save, X, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

// යූසර්ලා කිහිපදෙනෙක් වැඩ කරන විට දත්ත ප්‍රමාද වීම වැළැක්වීමට Socket සම්බන්ධ කරයි
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);

const Accounts = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // User Management State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'Staff', 
    image: '',
    businessId: '' // Shop එක හඳුනාගැනීමට අත්‍යවශ්‍යයි
  });

  useEffect(() => {
    // localStorage එකෙන් වර්තමාන Admin/User විස්තර ලබා ගැනීම
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setFormData(prev => ({ ...prev, businessId: user.businessId || user._id }));
    }
    fetchUsers();

    // වෙනත් යූසර් කෙනෙක් දත්ත වෙනස් කළහොත් වහාම Update වීම සඳහා
    socket.on('user-update-sync', fetchUsers);
    return () => { socket.off('user-update-sync'); };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { console.error("User fetch error"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // User Edit කිරීම
        await axios.put(`/api/users/${selectedUserId}`, formData);
        toast.success("User Profile Updated!");
      } else {
        // අලුත් Staff කෙනෙක් Register කිරීම
        // මෙහිදී businessId එක අනිවාර්යයෙන්ම Backend එකට යැවිය යුතුය
        await axios.post('/api/users/register', {
          ...formData,
          businessId: currentUser.businessId || currentUser._id
        });
        toast.success("New Staff Member Added!");
      }
      
      socket.emit('update-data'); // සියලුම පැනල් Update කිරීමට signal එකක් යවයි
      resetForm();
      fetchUsers();
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Action failed. Check username availability."); 
    } finally { setLoading(false); }
  };

  const handleEdit = (user: any) => {
    setIsEditing(true);
    setSelectedUserId(user._id);
    setFormData({ 
      name: user.name, 
      username: user.username, 
      password: '', // Edit කරද්දී Password එක හිස්ව තබයි (අවශ්‍ය නම් පමණක් වෙනස් කිරීමට)
      role: user.role, 
      image: user.image || '',
      businessId: user.businessId
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedUserId(null);
    setFormData({ 
      name: '', 
      username: '', 
      password: '', 
      role: 'Staff', 
      image: '',
      businessId: currentUser?.businessId || currentUser?._id 
    });
  };

  const handleMasterReset = async () => {
    if (!adminPassword) return toast.error("Please enter password");
    try {
      const verify = await axios.post('/api/auth/verify-admin', { 
        username: currentUser.username, 
        password: adminPassword 
      });

      if (verify.data.success) {
        if(confirm("අවවාදයයි! සියලුම විකුණුම් වාර්තා, බඩු ලැයිස්තු සහ ගිණුම් මැකී යනු ඇත. මෙය නැවත ලබා ගත නොහැක. දිගටම කරගෙන යනවාද?")) {
          await axios.post('/api/system/reset-shop', { businessId: currentUser.businessId });
          localStorage.clear();
          toast.warn("Shop Data Wiped Successfully!");
          window.location.href = '/register';
        }
      } else {
        toast.error("Invalid Admin Password!");
      }
    } catch (err) { toast.error("Verification failed"); }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) return toast.error("Image must be less than 1MB");
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
              <UserCircle className="text-indigo-600" /> Account Management
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Control staff access and system security</p>
          </div>
          <button onClick={fetchUsers} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 h-fit sticky top-0">
            <h2 className="text-xl font-black italic mb-6 uppercase flex items-center gap-2 text-slate-700">
              {isEditing ? <Edit3 size={20} className="text-amber-500" /> : <UserPlus size={20} className="text-indigo-600" />} 
              {isEditing ? 'Modify Profile' : 'Staff Registration'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-28 h-28 bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl group">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                       <UserCircle className="w-16 h-16 text-indigo-200" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="text-white" size={24} />
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 rounded-2xl p-1">
                  <input type="text" placeholder="Full Name" className="w-full p-4 bg-transparent outline-none font-bold text-sm" required 
                    onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-1">
                  <input type="text" placeholder="Username (Login ID)" className="w-full p-4 bg-transparent outline-none font-bold text-sm" required 
                    onChange={e => setFormData({...formData, username: e.target.value})} value={formData.username} />
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-1">
                  <input type="password" placeholder={isEditing ? "Leave blank to keep same" : "Password"} className="w-full p-4 bg-transparent outline-none font-bold text-sm" required={!isEditing}
                    onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
                </div>
                
                <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xs uppercase" value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Staff">Staff Member</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                )}
                <button disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                  {loading ? 'Processing...' : <><Save size={14} /> {isEditing ? 'Save Changes' : 'Create Account'}</>}
                </button>
              </div>
            </form>
          </div>

          {/* User List Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase text-slate-700">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.length > 0 ? users.map((u: any) => (
                  <div key={u._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden shadow-sm border-2 border-slate-100">
                        {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-indigo-600 bg-indigo-50">{u.name[0]}</div>}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-[10px] truncate w-24">{u.name}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase">@{u.username} • {u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={14} /></button>
                      {u.role !== 'Admin' && (
                        <button onClick={async () => { if(confirm(`Delete ${u.name}?`)) { await axios.delete(`/api/users/${u._id}`); fetchUsers(); toast.info("User Removed"); } }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                )) : <p className="text-center py-10 font-bold text-slate-300 uppercase text-xs">No staff registered yet</p>}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-50 p-8 rounded-[3rem] border-2 border-rose-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-lg font-black italic uppercase text-rose-600 flex items-center gap-2 mb-1">
                  <ShieldAlert size={20} /> Reset Shop Account
                </h2>
                <p className="text-rose-400 text-[10px] font-bold uppercase opacity-80">This will permanently delete all shop data including bills and stock.</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                Wipe Data
              </button>
            </div>
          </div>
        </div>

        {/* Master Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-sm text-center shadow-2xl">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                <KeyRound size={40} />
              </div>
              <h2 className="font-black text-xl mb-2 uppercase italic text-slate-800">Admin Authentication</h2>
              <p className="text-slate-500 text-[10px] mb-8 font-black uppercase tracking-widest leading-relaxed">Please enter your administrator password to authorize the complete system reset.</p>
              
              <input type="password" placeholder="ADMIN PASSWORD" className="w-full p-5 bg-slate-100 rounded-2xl mb-6 outline-none border-2 border-transparent focus:border-rose-600 text-center font-black text-sm tracking-[0.3em]"
                onChange={(e) => setAdminPassword(e.target.value)} />
              
              <div className="flex gap-3">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 font-black bg-slate-100 rounded-2xl text-slate-400 uppercase text-[10px]">Cancel</button>
                <button onClick={handleMasterReset} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-rose-200">Reset System</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Accounts;
