import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, Search, Loader2, Filter, 
  Calendar, CheckCircle2, PhoneCall
} from 'lucide-react';

const SuperAdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const { user } = useAuth();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/contacts`, config);
      setContacts(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user.token]);

  const adminList = Array.from(new Set(contacts.map(c => c.owner?._id).filter(Boolean))).map(id => {
    const found = contacts.find(c => c.owner?._id === id);
    return { id, name: found?.owner?.name };
  });

  const statuses = ['New', 'Interested', 'Not Interested', 'Call Back', 'Converted', 'Invalid Number'];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(search.toLowerCase()) || 
                          contact.phone.includes(search);
    const matchesStatus = statusFilter ? contact.status === statusFilter : true;
    const matchesAdmin = adminFilter ? contact.owner?._id === adminFilter : true;
    return matchesSearch && matchesStatus && matchesAdmin;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-[#3f7abe]" /> Calling Directory Contacts
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Global log of telecaller dialer lists, lead conversions, and calling states.</p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3f7abe] transition-colors" />
              <input 
                type="text" 
                placeholder="Search contacts by name, phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
            </div>
            
            {/* Filter selection */}
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold text-xs text-slate-700 focus:bg-white focus:border-[#3f7abe]"
                >
                  <option value="">All Call Statuses</option>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredContacts.length} Contacts</span>
        </div>

        {/* Contact List */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving contacts database...</p>
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Owner (Admin)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Telecaller</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Call Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Dialed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5">
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">{contact.name}</p>
                        <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{contact.remarks || 'No remarks recorded'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                       <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-bold">
                         <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}
                       </span>
                    </td>
                    <td className="p-5">
                      {contact.owner ? (
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none">{contact.owner.name}</p>
                          <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 inline-block">{contact.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">N/A</span>
                      )}
                    </td>
                    <td className="p-5">
                      {contact.assignedTo ? (
                        <span className="text-xs font-bold text-slate-700">{contact.assignedTo.name}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Unassigned</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        contact.status === 'Converted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : contact.status === 'New'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : contact.status === 'Not Interested'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(contact.updatedAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No Contacts found</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminContactsPage;
