import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, ShieldAlert, Trash2, KeyRound, Camera } from 'lucide-react';

const Accounts = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'Staff', image: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    if (user.role === 'Admin') fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { console.error("User fetch error"); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', newUser);
      toast.success("User Added Successfully!");
      setNewUser({ name: '', username: '', password: '', role: 'Staff', image: '' });
      fetchUsers();
    } catch (err) { toast.error("Failed to add user"); }
  };

  const handleMasterReset = async () => {
    try {
      // Admin ගේ Password එක පරීක්ෂා කිරීම (API හරහා)
      const verify = await axios.post('/api/auth/verify-admin', { 
        username: currentUser.username, 
        password: adminPassword 
      });

      if (verify.data.success) {
        await axios.post('/api/system/reset');
        localStorage.clear();
        toast.warn("System Data Wiped Successfully!");
        window.location.href = '/register'; // නැවත මුලටම යැවීම
      } else {
        toast.error("Invalid Admin Password!");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter">Accounts & Security</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Admin Only: User Management */}
          {currentUser?.role === 'Admin' && (
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-black italic mb-6 uppercase flex items-center gap-2">
                <UserPlus className="text-indigo-600" /> User Management
              </h2>
              
              <form onSubmit={handleAddUser} className="space-y-4 mb-8 bg-slate-50 p-6 rounded-3xl">
                <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl border-none outline-none" required 
                  onChange={e => setNewUser({...newUser, name: e.target.value})} value={newUser.name} />
                <input type="text" placeholder="Username" className="w-full p-3 rounded-xl border-none outline-none" required 
                  onChange={e => setNewUser({...newUser, username: e.target.value})} value={newUser.username} />
                <input type="password" placeholder="Password" className="w-full p-3 rounded-xl border-none outline-none" required 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} value={newUser.password} />
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs">Register Staff Member</button>
              </form>

              <div className="space-y-2">
                {users.map((u: any) => (
                  <div key={u._id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold">{u.name[0]}</div>
                      <div>
                        <p className="font-bold text-sm uppercase">{u.name}</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase">{u.role}</p>
                      </div>
                    </div>
                    {u.role !== 'Admin' && (
                      <button onClick={async () => { await axios.delete(`/api/users/${u._id}`); fetchUsers(); }} className="text-rose-500 p-2"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone: System Reset */}
          <div className="space-y-10">
            <div className="bg-rose-50 p-10 rounded-[3rem] border-2 border-rose-100 shadow-sm relative overflow-hidden">
              <h2 className="text-xl font-black italic uppercase text-rose-600 flex items-center gap-2 mb-4">
                <ShieldAlert /> System Master Reset
              </h2>
              <p className="text-slate-600 text-sm font-medium mb-8 italic leading-relaxed">
                මෙමගින් පද්ධතියේ ඇති සියලුම දත්ත (Products, Invoices) මැකී යන අතර ඔබව ලියාපදිංචි වීමේ පිටුවට යොමු කරයි.
              </p>
              <button onClick={() => setShowResetModal(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-rose-200">
                Wipe All Data
              </button>
            </div>
          </div>
        </div>

        {/* Secure Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center border-t-8 border-rose-600">
              <KeyRound className="mx-auto text-rose-600 mb-4" size={48} />
              <h2 className="font-black text-xl mb-2 uppercase italic text-slate-800">Security Check</h2>
              <p className="text-slate-500 text-xs mb-6 font-bold uppercase tracking-widest">Enter Admin Password to Confirm</p>
              
              <input 
                type="password" 
                placeholder="Admin Password" 
                className="w-full p-4 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-rose-600 text-center font-bold"
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <div className="flex gap-4">
                <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 font-bold bg-slate-100 rounded-2xl text-slate-500">CANCEL</button>
                <button onClick={handleMasterReset} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black">RESET NOW</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Accounts;
