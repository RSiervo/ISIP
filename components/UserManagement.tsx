
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { AdminUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: ''
  });

  useEffect(() => {
    setUsers(storageService.getUsers());
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name) return;
    
    const user: AdminUser = {
      ...newUser,
      id: uuidv4(),
      lastLogin: new Date().toISOString()
    };
    
    storageService.saveUser(user);
    setUsers(storageService.getUsers());
    setShowAddForm(false);
    setNewUser({ username: '', password: '', name: '', role: '' });
    showFeedback(`Operator ${user.name} provisioned successfully.`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    storageService.updateUser(editingUser);
    setUsers(storageService.getUsers());
    const name = editingUser.name;
    setEditingUser(null);
    showFeedback(`Identity record for ${name} updated.`);
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    
    if (users.length <= 1) {
      showFeedback("System requires at least one administrative node.", "error");
      setDeletingUser(null);
      return;
    }

    const name = deletingUser.name;
    storageService.deleteUser(deletingUser.id);
    setUsers(storageService.getUsers());
    setDeletingUser(null);
    showFeedback(`Operator ${name} deauthorized and access revoked.`);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-10 right-10 z-[300] animate-slide-left">
          <div className={`flex items-center space-x-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'}`}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {notification.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
            </div>
            <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.5em]">
            <span className="w-8 h-px bg-current"></span>
            <span>Security Protocols</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] pl-1">
            Access Control & Operator Management
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="px-8 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center space-x-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>Back to Console</span>
          </button>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-6 shadow-2xl active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Provision User</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[4.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                <th className="px-14 py-10 text-left text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800">Operator Profile</th>
                <th className="px-10 py-10 text-left text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800">Identifier</th>
                <th className="px-10 py-10 text-left text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800">Designation</th>
                <th className="px-10 py-10 text-left text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800">Last Session</th>
                <th className="px-14 py-10 text-right text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.05] transition-all group">
                  <td className="px-14 py-10">
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                        {u.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Authorized Node
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">@{u.username}</span>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{u.role}</span>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {u.lastLogin === 'Never' ? 'Pending First Sync' : new Date(u.lastLogin).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-14 py-10 text-right">
                    <div className="flex items-center justify-end space-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingUser({...u})}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeletingUser(u)}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Deauthorize
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION USER MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Provision Node</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Administrative Access Protocols</p>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                  <input type="text" placeholder="Operator Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Role</label>
                  <input type="text" placeholder="e.g. Lead Strategist" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" placeholder="Access ID" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Key</label>
                  <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Modify Identity</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Update Credentials & Details</p>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                  <input type="text" placeholder="Operator Name" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Role</label>
                  <input type="text" placeholder="e.g. Lead Strategist" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" placeholder="Access ID" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Key</label>
                  <input type="password" placeholder="Leave blank to keep current" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 border border-rose-500/20 shadow-[0_50px_100px_rgba(244,63,94,0.15)] text-center space-y-8">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Revoke Access?</h2>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Irreversible Protocol</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed pt-2">
                You are about to permanently deauthorize <span className="text-slate-900 dark:text-white">@{deletingUser.username}</span>. All administrative privileges will be immediately terminated.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteUser}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
              >
                Confirm Revocation
              </button>
              <button 
                onClick={() => setDeletingUser(null)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
