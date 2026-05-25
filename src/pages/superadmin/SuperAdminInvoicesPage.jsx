import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FileSpreadsheet, Search, Loader2, Filter, 
  Calendar, FileText
} from 'lucide-react';

const SuperAdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const { user } = useAuth();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/invoices`, config);
      setInvoices(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user.token]);

  const adminList = Array.from(new Set(invoices.map(i => i.owner?._id).filter(Boolean))).map(id => {
    const found = invoices.find(i => i.owner?._id === id);
    return { id, name: found?.owner?.name };
  });

  const statuses = ['Draft', 'Sent', 'Paid', 'Partial', 'Cancelled'];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = (invoice.leadId?.name && invoice.leadId.name.toLowerCase().includes(search.toLowerCase())) || 
                          (invoice.invoiceNo && invoice.invoiceNo.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? invoice.status === statusFilter : true;
    const matchesAdmin = adminFilter ? invoice.owner?._id === adminFilter : true;
    return matchesSearch && matchesStatus && matchesAdmin;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-[#3f7abe]" /> Global Invoices Registry
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Review all tax invoices, billing states, and quotations finalized as formal invoices.</p>
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
                placeholder="Search invoices by lead name, invoice #..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
            </div>
            
            {/* Dropdowns */}
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredInvoices.length} Invoices</span>
        </div>

        {/* Invoices list */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving invoice records...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Account</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Franchise (Admin)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Taxable Value</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Total</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5 font-black text-xs text-[#3f7abe]">{invoice.invoiceNo}</td>
                    <td className="p-5">
                      {invoice.leadId ? (
                        <span className="text-xs font-black text-slate-900 uppercase">{invoice.leadId.name}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">Lead Deleted</span>
                      )}
                    </td>
                    <td className="p-5">
                      {invoice.owner ? (
                        <p className="text-xs font-black text-slate-800 uppercase leading-none">{invoice.owner.name}</p>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">N/A</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        invoice.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : invoice.status === 'Sent'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : invoice.status === 'Draft'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-5 text-right text-xs text-slate-500 font-bold">
                      ₹{(invoice.taxableValue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-5 text-right font-black text-xs text-slate-900">
                      ₹{invoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No Invoices found</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminInvoicesPage;
