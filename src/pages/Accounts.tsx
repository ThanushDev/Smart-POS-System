import React, { useState, useEffect } from 'react';
    import Sidebar from '../components/Sidebar';
    import { UserPlus, Shield, MoreVertical, X, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { toast } from 'react-toastify';

    const Accounts = () => {
      const [users, setUsers] = useState<any[]>([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingUser, setEditingUser] = useState<any>(null);
      const [userImage, setUserImage] = useState<string>('');

      useEffect(() => {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) setUsers(JSON.parse(savedUsers));
      }, []);

      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUserImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

      const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const userData = {
          id: editingUser ? editingUser.id : Math.random().toString(36).substr(2, 9),
          name: formData.get('name') as string,
          username: formData.get('username') as string,
          password: formData.get('password') as string,
          role: formData.get('role') as string,
          image: userImage || (editingUser ? editingUser.image : ''),
          status: 'Active'
        };

        let updatedUsers;
        if (editingUser) {
          updatedUsers = users.map(u => u.id === editingUser.id ? userData : u);
          toast.success("Account updated successfully!");
        } else {
          updatedUsers = [...users, userData];
          toast.success("Account created successfully!");
        }

        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        closeModal();
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setUserImage('');
      };

      const openEditModal = (user: any) => {
        setEditingUser(user);
        setUserImage(user.image);
        setIsModalOpen(true);
      };

      return (
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-slate-900">User Management</h1>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                <UserPlus size={20} />
                Create Account
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Shield size={14} className="text-indigo-500" />
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatePresence>
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">
                        {editingUser ? 'Edit Account' : 'Create New Account'}
                      </h2>
                      <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                      <div className="flex justify-center">
                        <label className="relative cursor-pointer group">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all overflow-hidden">
                            {userImage ? (
                              <img src={userImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">Photo</span>
                              </>
                            )}
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input name="name" defaultValue={editingUser?.name} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username / Email</label>
                        <input name="username" defaultValue={editingUser?.username} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input name="password" type="password" defaultValue={editingUser?.password} required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select name="role" defaultValue={editingUser?.role || 'employee'} className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20">
                          <option value="employee">Employee</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div className="pt-4">
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                          {editingUser ? 'Update Account' : 'Create Account'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      );
    };

    export default Accounts;
