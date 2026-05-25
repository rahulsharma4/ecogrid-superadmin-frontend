import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  UserSquare2, Search, Loader2, Filter, Download, 
  Calendar, CheckCircle2, DollarSign, Zap
} from 'lucide-react';

const SuperAdminLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const { user } = useAuth();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/leads`, config);
      setLeads(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user.token]);

  // Unique lists for filters
  const adminList = Array.from(new Set(leads.map(l => l.owner?._id).filter(Boolean))).map(id => {
    const found = leads.find(l => l.owner?._id === id);
    return { id, name: found?.owner?.name };
  });

  const statuses = [
    'New', 'Contacted', 'Follow-up Scheduled', 'Site Visit Scheduled', 
    'Meeting Done', 'Quotation Sent', 'Booked', 'Installation Underway', 
    'Completed', 'Cancelled', 'Closed'
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          (lead.companyName && lead.companyName.toLowerCase().includes(search.toLowerCase())) ||
                          lead.phone.includes(search);
    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const matchesAdmin = adminFilter ? lead.owner?._id === adminFilter : true;
    return matchesSearch && matchesStatus && matchesAdmin;
  });

  const exportToExcel = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads available to export');
      return;
    }

    const dataToExport = filteredLeads.map(lead => ({
      'Lead Name': lead.name,
      'Email': lead.email || 'N/A',
      'Phone': lead.phone,
      'Address': lead.address,
      'Solar Capacity': lead.solarCapacity || 'N/A',
      'Roof Type': lead.roofType || 'N/A',
      'Property Type': lead.propertyType || 'N/A',
      'Status': lead.status,
      'Source': lead.source,
      'Quotation Amount (INR)': lead.quotationAmount || 0,
      'Admin Owner': lead.owner?.name || 'N/A',
      'Assigned Agent': lead.assignedTo?.name || 'Unassigned',
      'Created At': new Date(lead.createdAt).toLocaleDateString('en-GB')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Global Leads');
    XLSX.writeFile(workbook, `SolarHub_Global_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Leads database exported to Excel successfully!');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
      case 'Booked':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Cancelled':
      case 'Closed':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Installation Underway':
      case 'Quotation Sent':
        return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserSquare2 className="w-7 h-7 text-[#3f7abe]" /> Global Leads pipeline
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Audit lead progress, solar assignments, and staff workflows globally.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" /> Export Report (Excel)
        </button>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3f7abe] transition-colors" />
              <input 
                type="text" 
                placeholder="Search leads by name, company..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold text-xs text-slate-700 focus:bg-white focus:border-[#3f7abe]"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredLeads.length} Leads</span>
        </div>

        {/* Lead List */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving leads database...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Name</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Owner (Admin)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Operative</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Solar Capacity</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quoted Amount</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5">
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">{lead.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{lead.phone}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      {lead.owner ? (
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none">{lead.owner.name}</p>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 inline-block">{lead.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">N/A</span>
                      )}
                    </td>
                    <td className="p-5">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Unassigned</span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#3f7abe]/5 text-[#3f7abe] font-black text-[10px]">
                        <Zap className="w-3 h-3 text-[#3f7abe]" /> {lead.solarCapacity || 'N/A'}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-5 text-right font-black text-xs text-slate-900">
                      ₹{(lead.quotationAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-2.5 border-none">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <UserSquare2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No Leads found matching this criteria</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminLeadsPage;
