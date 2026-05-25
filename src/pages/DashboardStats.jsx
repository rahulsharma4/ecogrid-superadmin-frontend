import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Loader2,
  Calendar,
  Zap,
  CreditCard,
  Target,
  ArrowRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const DashboardStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const url = user?.role === 'superadmin' 
          ? `${import.meta.env.VITE_API_BASE_URL}/superadmin/stats`
          : `${import.meta.env.VITE_API_BASE_URL}/dashboard/stats`;
        const { data } = await axios.get(url, config);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token, user.role]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-10 h-10 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Compiling Analytics...</p>
    </div>
  );

  if (user?.role === 'superadmin' || data?.role === 'superadmin') {
    const superAdminCards = [
      { 
        title: 'System Revenue', 
        value: data?.totalRevenue ? `₹${(data.totalRevenue / 100000).toFixed(2)}L` : '₹0', 
        icon: CreditCard, 
        color: 'text-emerald-700', 
        bg: 'bg-emerald-50', 
        path: '/dashboard/superadmin/payments',
        desc: 'Global lifetime collections'
      },
      { 
        title: 'Global Leads', 
        value: data?.totalLeads || 0, 
        icon: Target, 
        color: 'text-[#3f7abe]', 
        bg: 'bg-[#3f7abe]/5', 
        path: '/dashboard/superadmin/leads',
        desc: 'Global pipeline size'
      },
      { 
        title: 'Franchise Admins', 
        value: data?.totalAdmins || 0, 
        icon: Users, 
        color: 'text-orange-700', 
        bg: 'bg-orange-50', 
        path: '/dashboard/superadmin/admins',
        desc: 'Active franchise nodes'
      },
      { 
        title: 'Global Staff', 
        value: data?.totalStaff || 0, 
        icon: Activity, 
        color: 'text-purple-700', 
        bg: 'bg-purple-50', 
        path: '/dashboard/superadmin/staff',
        desc: 'Total staff/telecallers'
      },
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
        
        {/* Command Center Title */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Super Admin Command Center</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">EcoGrid Infrastructure Global Monitor</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            System Online
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {superAdminCards.map((card, i) => (
            <div 
              key={i} 
              onClick={() => navigate(card.path)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group active:scale-95 flex items-center gap-3"
            >
               <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                 <card.icon className={`w-5 h-5 ${card.color}`} />
               </div>
               <div className="min-w-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{card.title}</p>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-0.5">{card.value}</h2>
                  <span className="text-[7px] text-slate-400 font-medium block mt-0.5 truncate">{card.desc}</span>
               </div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Growth Area Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">System Load & Conversion Velocity</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Aggregate Monthly Leads Inflow</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">
                 <TrendingUp className="w-3 h-3 text-[#3f7abe]" />
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global Network</span>
              </div>
            </div>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorGlobalLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f7abe" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3f7abe" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                    dy={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                    itemStyle={{fontWeight: 900, color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px'}}
                    cursor={{stroke: '#3f7abe', strokeWidth: 2, strokeDasharray: '5 5'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3f7abe" 
                    strokeWidth={6}
                    fillOpacity={1} 
                    fill="url(#colorGlobalLeads)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Health / Status Breakdown Panel */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
             {/* Status distribution */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="text-center mb-2">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Status Distribution</h3>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Pipeline States</p>
                </div>
                
                <div className="h-32 w-full relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={data?.statusDistribution || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={32}
                            outerRadius={42}
                            paddingAngle={4}
                            dataKey="value"
                         >
                            {(data?.statusDistribution || []).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6]} />
                            ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px'}}
                            itemStyle={{fontWeight: 900, fontSize: '8px', textTransform: 'uppercase'}}
                         />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[7px] font-black text-slate-400 uppercase">Leads</span>
                      <span className="text-sm font-black text-slate-900">{data?.totalLeads || 0}</span>
                   </div>
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1 mt-2">
                   {(data?.statusDistribution || []).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-[8px] font-black">
                         <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6] }}></div>
                            <span className="text-slate-500 uppercase truncate">{entry.name}</span>
                         </div>
                         <span className="text-slate-900">{entry.value}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* System Health Status Widget */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">System Environment</h3>
                
                <div className="space-y-2 text-[9px] font-black uppercase text-slate-600">
                   <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>Database connection</span>
                      <span className="text-emerald-600 font-bold">{data?.systemHealth?.dbStatus || 'Connected'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>Express listener port</span>
                      <span className="text-slate-900">{data?.systemHealth?.port || '5002'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span>Node environment</span>
                      <span className="text-[#f6871e]">{import.meta.env.MODE || 'development'}</span>
                   </div>
                   <div className="flex justify-between">
                      <span>Uptime</span>
                      <span className="text-slate-900">{Math.floor((data?.systemHealth?.uptime || 0) / 60)} minutes</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Row 2: Top Performing Franchise Admins & Global Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
           {/* Top Franchise Nodes */}
           <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">Top Franchise Admins</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {data?.topAdmins?.length > 0 ? (
                  data.topAdmins.map((adm, i) => (
                    <div key={adm._id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-black uppercase">
                        <span className="text-slate-900">{adm.name}</span>
                        <span className="text-[#3f7abe]">₹{(adm.revenue || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                        <span>{adm.email}</span>
                        <span>{adm.leadCount} total leads</span>
                      </div>
                      {/* Visual bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-[#3f7abe] to-[#f6871e] rounded-full" 
                           style={{ width: `${Math.min(100, Math.max(10, (adm.revenue / (data.totalRevenue || 1)) * 100))}%` }}
                         ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-black text-slate-400 uppercase text-center py-10">No admin operations active yet</p>
                )}
              </div>
           </div>

           {/* Global Leads Feed */}
           <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">Recent Network Leads</h3>
                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {data?.recentLeads?.length > 0 ? (
                     data.recentLeads.slice(0, 5).map(lead => (
                       <div key={lead._id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/dashboard/superadmin/leads')}>
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#3f7abe] group-hover:text-white transition-all shrink-0">
                             <Zap className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex justify-between items-center">
                               <p className="text-[10px] text-slate-900 font-black truncate uppercase leading-none group-hover:text-[#3f7abe] transition-colors">{lead.name}</p>
                               <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-500 font-black uppercase shrink-0">{lead.status}</span>
                             </div>
                             <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                                Franchise: <strong className="text-slate-600">{lead.owner?.name || 'Deleted'}</strong> | Agent: {lead.assignedTo?.name || 'Unassigned'}
                             </p>
                          </div>
                       </div>
                     ))
                   ) : (
                     <p className="text-[10px] font-black text-slate-400 uppercase text-center py-10">No leads created on system yet</p>
                   )}
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/dashboard/superadmin/leads')}
                className="w-full mt-4 py-3 bg-[#3f7abe] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 hover:bg-[#33629c] transition-all text-center"
              >
                 View Global Lead Pipeline
              </button>
           </div>
        </div>

      </div>
    );
  }

  if (data?.role === 'telecaller') {
    const telecallerCards = [
      { 
        title: 'Assigned Contacts', 
        value: data?.totalContacts || 0, 
        icon: Target, 
        color: 'text-[#3f7abe]', 
        bg: 'bg-[#3f7abe]/5', 
        path: '/dashboard/contacts',
        desc: 'Total assigned'
      },
      { 
        title: 'New / Uncalled', 
        value: data?.pendingContacts || 0, 
        icon: Clock, 
        color: 'text-orange-700', 
        bg: 'bg-orange-50', 
        path: '/dashboard/contacts',
        desc: 'Awaiting calls'
      },
      { 
        title: 'Converted Leads', 
        value: data?.convertedContacts || 0, 
        icon: CheckCircle2, 
        color: 'text-emerald-700', 
        bg: 'bg-emerald-50', 
        path: '/dashboard/contacts',
        desc: 'Sent to pipeline'
      },
      { 
        title: 'Success Rate', 
        value: data?.totalContacts ? `${Math.round(((data.convertedContacts || 0) / data.totalContacts) * 100)}%` : '0%', 
        icon: TrendingUp, 
        color: 'text-purple-700', 
        bg: 'bg-purple-50', 
        path: '/dashboard/contacts',
        desc: 'Conversion rate'
      },
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {telecallerCards.map((card, i) => (
            <div 
              key={i} 
              onClick={() => navigate(card.path)}
              className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group active:scale-95 flex items-center gap-3"
            >
               <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                 <card.icon className={`w-5 h-5 ${card.color}`} />
               </div>
               <div className="min-w-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{card.title}</p>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-0.5">{card.value}</h2>
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
           {/* Pie Chart */}
           <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="mb-4 text-center">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Calling Directory status</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Call List Breakdown</p>
              </div>
              
              <div className="h-48 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data?.contactStatusDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {(data?.contactStatusDistribution || []).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6]} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px'}}
                          itemStyle={{fontWeight: 900, fontSize: '8px', textTransform: 'uppercase'}}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Assigned</span>
                    <span className="text-sm font-black text-slate-900">{data?.totalContacts || 0}</span>
                  </div>
               </div>

               <div className="mt-4 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {(data?.contactStatusDistribution || []).map((entry, index) => (
                     <div key={index} className="flex items-center justify-between text-[8px] font-black">
                        <div className="flex items-center gap-1.5 min-w-0">
                           <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6] }}></div>
                           <span className="text-slate-500 uppercase truncate">{entry.name}</span>
                        </div>
                        <span className="text-slate-900">{entry.value}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Recent Contacts calling log */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Recent Calls / Actions</h3>
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
               </div>
               <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {data?.recentContacts?.length > 0 ? (
                    data.recentContacts.map((contact) => (
                      <div key={contact._id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/dashboard/contacts')}>
                         <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#3f7abe] group-hover:text-white transition-all shrink-0">
                            <Zap className="w-4 h-4" />
                         </div>
                         <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] text-slate-900 font-black group-hover:text-[#3f7abe] transition-colors truncate uppercase leading-tight">
                                {contact.name}
                              </p>
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-50 font-black text-slate-500 uppercase border border-slate-100">{contact.status}</span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold mt-0.5 truncate uppercase">
                              {contact.remarks || 'No remarks added'}
                            </p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[8px] font-black text-slate-300 uppercase text-center mt-10">No recent calls</p>
                  )}
               </div>
               <button 
                 onClick={() => navigate('/dashboard/contacts')}
                 className="mt-4 w-full py-2.5 bg-[#3f7abe] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 hover:bg-[#33629c] transition-all"
               >
                 Go to My Contacts
               </button>
            </div>
         </div>
       </div>
     );
  }

  const cards = [
    { 
      title: 'Gross Revenue', 
      value: data?.totalRevenue ? `₹${(data.totalRevenue / 100000).toFixed(2)}L` : '₹0', 
      icon: CreditCard, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50', 
      path: '/dashboard/payments',
      desc: 'Lifetime collections'
    },
    { 
      title: 'Total Pipeline', 
      value: data?.totalLeads || 0, 
      icon: Target, 
      color: 'text-[#3f7abe]', 
      bg: 'bg-[#3f7abe]/5', 
      path: '/dashboard/leads',
      desc: 'Active lead flow'
    },
    { 
      title: 'Team Strength', 
      value: data?.staffCount || 0, 
      icon: Users, 
      color: 'text-orange-700', 
      bg: 'bg-orange-50', 
      path: '/dashboard/staff',
      desc: 'Field operatives'
    },
    { 
      title: 'Pending Action', 
      value: data?.pendingLeads || 0, 
      icon: Clock, 
      color: 'text-purple-700', 
      bg: 'bg-purple-50', 
      path: '/dashboard/leads',
      desc: 'Awaiting touchpoint'
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      
      {/* Ultra-Compact KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigate(card.path)}
            className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group active:scale-95 flex items-center gap-3"
          >
             <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
               <card.icon className={`w-5 h-5 ${card.color}`} />
             </div>
             <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{card.title}</p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-0.5">{card.value}</h2>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Growth Analytics Chart - Compact */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Growth Velocity</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly lead trajectory</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">
               <TrendingUp className="w-3 h-3 text-[#3f7abe]" />
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Hub</span>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f7abe" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3f7abe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                  itemStyle={{fontWeight: 900, color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px'}}
                  cursor={{stroke: '#3f7abe', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3f7abe" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution Pie Chart - Side by Side */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="mb-4 text-center">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Pipeline</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status Breakdown</p>
              </div>
              
              <div className="h-32 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data?.statusDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {(data?.statusDistribution || []).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6]} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px'}}
                          itemStyle={{fontWeight: 900, fontSize: '8px', textTransform: 'uppercase'}}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Total</span>
                    <span className="text-sm font-black text-slate-900">{data?.totalLeads || 0}</span>
                 </div>
              </div>

              <div className="mt-4 space-y-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                 {(data?.statusDistribution || []).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-[8px] font-black">
                       <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6] }}></div>
                          <span className="text-slate-500 uppercase truncate">{entry.name}</span>
                       </div>
                       <span className="text-slate-900">{entry.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Compact Pulse Feed */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Pulse</h3>
                 <Activity className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                 {data?.recentLeads?.length > 0 ? (
                   data.recentLeads.slice(0, 4).map((lead) => (
                     <div key={lead._id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/dashboard/leads')}>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#3f7abe] group-hover:text-white transition-all shrink-0">
                           <Zap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] text-slate-900 font-black group-hover:text-[#3f7abe] transition-colors truncate uppercase leading-tight">
                             {lead.name}
                           </p>
                           <p className="text-[8px] text-slate-400 font-bold mt-0.5 truncate uppercase">
                             By {lead.assignedTo?.name || 'Unassigned'}
                           </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-[8px] font-black text-slate-300 uppercase text-center mt-10">Static State</p>
                 )}
              </div>
              <button 
                onClick={() => navigate('/dashboard/leads')}
                className="mt-4 w-full py-2.5 bg-[#3f7abe] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 hover:bg-[#33629c] transition-all"
              >
                Operations
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
