import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Activity, Search, Loader2, RefreshCw, 
  Clock, ShieldAlert, Monitor, Terminal
} from 'lucide-react';

const SuperAdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/logs`, config);
      setLogs(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user.token]);

  const filteredLogs = logs.filter(log => {
    const actorName = log.user?.name || 'Guest / System';
    return log.action.toLowerCase().includes(search.toLowerCase()) || 
           log.details.toLowerCase().includes(search.toLowerCase()) ||
           actorName.toLowerCase().includes(search.toLowerCase());
  });

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (action.includes('UPDATE')) return 'bg-orange-50 text-orange-700 border-orange-100';
    if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#3f7abe]" /> System Audit Trails
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time log of security logins, user registrations, and administrative updates.</p>
        </div>
        
        <button 
          onClick={fetchLogs}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" /> Refresh Logs
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#3f7abe] transition-colors" />
            <input 
              type="text" 
              placeholder="Search logs by action, description, or user..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">showing {filteredLogs.length} audit logs</span>
        </div>

        {/* Logs list */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling audit files...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/55 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Stamp</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Code</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator (Role)</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Description</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => {
                  const actor = log.user;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-5 text-xs text-slate-500 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString('en-GB')}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-5">
                        {actor ? (
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase leading-none">{actor.name}</p>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 inline-block">
                              {actor.role === 'superadmin' ? 'Super Admin' : actor.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold italic">System / Visitor</span>
                        )}
                      </td>
                      <td className="p-5 text-xs text-slate-700 font-bold max-w-sm whitespace-normal break-words">{log.details}</td>
                      <td className="p-5 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-slate-300" />
                          {log.ipAddress || 'local/internal'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-slate-400">
             <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-xs font-black uppercase tracking-widest">No activities logged yet</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminLogsPage;
