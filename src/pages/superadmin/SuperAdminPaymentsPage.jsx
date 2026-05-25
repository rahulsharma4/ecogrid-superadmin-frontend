import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, Search, Loader2, Filter, 
  Calendar, DollarSign, Wallet
} from 'lucide-react';

const SuperAdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const { user } = useAuth();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/payments`, config);
      setPayments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user.token]);

  const adminList = Array.from(new Set(payments.map(p => p.owner?._id).filter(Boolean))).map(id => {
    const found = payments.find(p => p.owner?._id === id);
    return { id, name: found?.owner?.name };
  });

  const modes = ['Cash', 'Online', 'Cheque', 'UPI', 'Bank Transfer'];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = (payment.leadId?.name && payment.leadId.name.toLowerCase().includes(search.toLowerCase())) || 
                          (payment.referenceNo && payment.referenceNo.toLowerCase().includes(search.toLowerCase()));
    const matchesMode = modeFilter ? payment.paymentMode === modeFilter : true;
    const matchesAdmin = adminFilter ? payment.owner?._id === adminFilter : true;
    return matchesSearch && matchesMode && matchesAdmin;
  });

  const totalCollected = filteredPayments.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#3f7abe]" /> Global Payments Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Audit all billing receipts, transaction modes, and incoming cash flow.</p>
        </div>
        
        {/* Metric banner inside header */}
        <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl flex items-center gap-3 shrink-0">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none">Total Revenue Scoped</p>
            <p className="text-lg font-black text-emerald-800 leading-none mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          </div>
        </div>
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
                placeholder="Search payments by lead name, ref..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
            </div>
            
            {/* Dropdown filters */}
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none appearance-none font-bold text-xs text-slate-700 focus:bg-white focus:border-[#3f7abe]"
                >
                  <option value="">All Modes</option>
                  {modes.map(md => (
                    <option key={md} value={md}>{md}</option>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Showing {filteredPayments.length} Transactions</span>
        </div>

        {/* Payments list */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving payment records...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Account</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Franchise</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference No</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage Type</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount Received</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-5">
                      {payment.leadId ? (
                        <span className="text-xs font-black text-slate-900 uppercase">{payment.leadId.name}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">Lead Deleted</span>
                      )}
                    </td>
                    <td className="p-5">
                      {payment.owner ? (
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase leading-none">{payment.owner.name}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">N/A</span>
                      )}
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">{payment.referenceNo || 'N/A'}</td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-bold text-[10px] border border-slate-100">
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-slate-600 font-medium">{payment.paymentType}</td>
                    <td className="p-5 text-right font-black text-xs text-emerald-600">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-5 text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(payment.paymentDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No payment records found</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminPaymentsPage;
