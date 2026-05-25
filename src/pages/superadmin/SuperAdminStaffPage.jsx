import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Users, Search, ShieldAlert, CheckCircle2, 
  Trash2, Loader2, Phone, Mail, Award, Filter
} from 'lucide-react';

const SuperAdminStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const { user } = useAuth();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/staff`, config);
      setStaff(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [user.token]);

  const handleToggleStatus = async (id, currentStatus) => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const actionText = currentStatus === 'active' ? 'blocking' : 'activating';
    const loadingToast = toast.loading(`Requesting ${actionText}...`);

    try {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/superadmin/staff/${id}/toggle`, {}, config);
      toast.success(data.message, { id: loadingToast });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status', { id: loadingToast });
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff member "${name}"?`)) return;
    
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const loadingToast = toast.loading('Removing staff member...');

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/superadmin/staff/${id}`, config);
      toast.success('Staff member removed successfully!', { id: loadingToast });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete staff member', { id: loadingToast });
    }
  };

  // Get unique Admins list for filter dropdown
  const adminList = Array.from(new Set(staff.map(s => s.owner?._id).filter(Boolean))).map(id => {
    const found = staff.find(s => s.owner?._id === id);
    return { id, name: found?.owner?.name };
  });

  const filteredStaff = staff.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.email.toLowerCase().includes(search.toLowerCase()) ||
                          item.phone.includes(search);
    const matchesRole = roleFilter ? item.role === roleFilter : true;
    const matchesAdmin = adminFilter ? item.owner?._id === adminFilter : true;
    return matchesSearch && matchesRole && matchesAdmin;
  });

  const totalConsultants = staff.filter(s => s.role === 'staff').length;
  const totalTelecallers = staff.filter(s => s.role === 'telecaller').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-[#3f7abe]" /> Global Staff Directory
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Monitor and manage all active consultants and telecallers across all Admin teams.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#3f7abe]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Operatives</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{staff.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f6871e]/10 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#f6871e]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultants / Staff</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{totalConsultants}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telecallers</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">{totalTelecallers}</h3>
          </div>
        </div>
      </div>

      {/* Main Table and Controls */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3f7abe] transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff by name, email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold text-xs text-slate-700 focus:bg-white focus:border-[#3f7abe]"
                >
                  <option value="">All Roles</option>
                  <option value="staff">Consultant</option>
                  <option value="telecaller">Telecaller</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select 
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold text-xs text-slate-700 focus:bg-white focus:border-[#3f7abe]"
                >
                  <option value="">All Admin Owners</option>
                  {adminList.map(adm => (
                    <option key={adm.id} value={adm.id}>{adm.name}</option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredStaff.length} members</span>
        </div>

        {/* Staff Table */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving directory...</p>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operative Info</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed By (Admin)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{member.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        member.role === 'staff' ? 'bg-[#f6871e]/10 text-[#f6871e]' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {member.role === 'staff' ? 'Consultant' : member.role}
                      </span>
                    </td>
                    <td className="p-5">
                      {member.owner ? (
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none">{member.owner.name}</p>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 inline-block">{member.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">Orphan / Deleted Owner</span>
                      )}
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">{member.phone}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        member.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => handleToggleStatus(member._id, member.status)}
                          title={member.status === 'active' ? 'Block user' : 'Unblock user'}
                          className={`p-2 rounded-lg border transition-all ${
                            member.status === 'active'
                              ? 'border-red-100 hover:bg-red-50 text-red-600'
                              : 'border-emerald-100 hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {member.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(member._id, member.name)}
                          title="Delete staff member"
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
             <p className="text-xs font-black uppercase tracking-widest">No staff members match this filter</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminStaffPage;
