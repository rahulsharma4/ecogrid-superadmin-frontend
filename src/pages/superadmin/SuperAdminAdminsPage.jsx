import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Users, UserPlus, Search, Edit2, ShieldAlert, CheckCircle2, 
  Trash2, X, Loader2, KeyRound, Phone, Mail, Award, CreditCard
} from 'lucide-react';

const SuperAdminAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/admins`, config);
      setAdmins(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [user.token]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', phone: '', password: '' });
    setSelectedAdminId(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setModalMode('edit');
    setFormData({ 
      name: admin.name, 
      email: admin.email, 
      phone: admin.phone, 
      password: '' 
    });
    setSelectedAdminId(admin._id);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const loadingToast = toast.loading(modalMode === 'add' ? 'Creating Admin Account...' : 'Updating Admin Account...');

    try {
      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/superadmin/admins`, formData, config);
        toast.success('Admin account created successfully!', { id: loadingToast });
      } else {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/superadmin/admins/${selectedAdminId}`, updateData, config);
        toast.success('Admin account updated successfully!', { id: loadingToast });
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed', { id: loadingToast });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const actionText = currentStatus === 'active' ? 'blocking' : 'activating';
    const loadingToast = toast.loading(`Requesting ${actionText}...`);

    try {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/superadmin/admins/${id}/toggle`, {}, config);
      toast.success(data.message, { id: loadingToast });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status', { id: loadingToast });
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Admin "${name}"? This action cannot be undone.`)) return;
    
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const loadingToast = toast.loading('Removing admin profile...');

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/superadmin/admins/${id}`, config);
      toast.success('Admin deleted successfully!', { id: loadingToast });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin', { id: loadingToast });
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(search.toLowerCase()) ||
    admin.email.toLowerCase().includes(search.toLowerCase()) ||
    admin.phone.includes(search)
  );

  const activeCount = admins.filter(a => a.status === 'active').length;
  const inactiveCount = admins.filter(a => a.status === 'inactive').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#3f7abe]" /> Admin Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure and monitor administrative accounts globally.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-[#3f7abe] hover:bg-[#33629c] text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#3f7abe]/25 transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Admin Account
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#3f7abe]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Admins</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{admins.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Accounts</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blocked Accounts</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{inactiveCount}</h3>
          </div>
        </div>
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3f7abe] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredAdmins.length} admins</span>
        </div>

        {/* Admin List */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Accounts...</p>
          </div>
        ) : filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator Info</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Staff Count</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Leads Owned</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue Generated</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3f7abe]/10 text-[#3f7abe] flex items-center justify-center font-black text-sm">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">{admin.phone}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        admin.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${admin.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {admin.status}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-slate-900 font-black text-center">{admin.staffCount || 0}</td>
                    <td className="p-5 text-xs text-slate-900 font-black text-center">{admin.leadCount || 0}</td>
                    <td className="p-5 text-xs text-emerald-600 font-black text-right">₹{(admin.revenue || 0).toLocaleString('en-IN')}</td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(admin._id, admin.status)}
                          title={admin.status === 'active' ? 'Block account' : 'Unblock account'}
                          className={`p-2 rounded-lg border transition-all ${
                            admin.status === 'active'
                              ? 'border-red-100 hover:bg-red-50 text-red-600'
                              : 'border-emerald-100 hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {admin.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(admin)}
                          title="Edit admin info"
                          className="p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-[#3f7abe] transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                          title="Delete account"
                          className="p-2 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No Administrator Accounts Found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  {modalMode === 'add' ? 'Create Admin Account' : 'Edit Admin Details'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Fill in credentials below</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="e.g. Rahul Bhardwaj"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input 
                  type="text" 
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Password {modalMode === 'edit' && '(Leave blank to keep current)'}
                </label>
                <input 
                  type="password" 
                  name="password"
                  required={modalMode === 'add'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-4 border border-slate-100 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase text-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-[#3f7abe] hover:bg-[#33629c] rounded-xl text-xs font-bold uppercase text-white shadow-lg shadow-[#3f7abe]/20 transition-all active:scale-95"
                >
                  {modalMode === 'add' ? 'Create Admin' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminAdminsPage;
