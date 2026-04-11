import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, ShieldAlert } from 'lucide-react';

const Accounts = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { toast.error("Could not load users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id: string) => {
    if (window.confirm("Delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast.success("User removed");
        fetchUsers();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  const handleResetAll = async () => {
    const pass = prompt("Enter Admin Password to WIPE ALL DATA:");
    if (!pass) return;
    try {
      const res = await axios.post('/api/admin/reset-all', { adminPassword: pass });
      if (res.data.success) {
        toast.success("System Reset Done!");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">User <span className="text-indigo-600">Accounts</span></h1>
        <button onClick={handleResetAll} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <ShieldAlert size={20} /> RESET ALL SHOP DATA
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-6">Name</th>
              <th className="p-6">Email</th>
              <th className="p-6">Role</th>
              <th className="p-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u._id} className="border-t">
                <td className="p-6 font-bold">{u.name}</td>
                <td className="p-6 text-slate-500">{u.email}</td>
                <td className="p-6 underline decoration-indigo-500 font-black italic">{u.role}</td>
                <td className="p-6">
                  {u.role !== 'Admin' && (
                    <button onClick={() => deleteUser(u._id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Accounts;
