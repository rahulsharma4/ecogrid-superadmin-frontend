import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import logo from '../assets/Logo.jpeg';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  FileText,
  Receipt,
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Settings,
  Circle,
  BookOpen,
  Shield,
  Terminal
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const themeColor = user?.companyDetails?.themeColor || '#3f7abe';
  const themeColorSecondary = user?.companyDetails?.themeColorSecondary || '#f6871e';

  useEffect(() => {
    // Dynamic favicon logic
    const faviconLink = document.querySelector("link[rel*='icon']");
    if (faviconLink) {
      faviconLink.href = user?.companyDetails?.companyLogo || logo;
    }
    // Dynamic document title logic
    const companyName = user?.companyDetails?.companyName || 'Solar Hub';
    document.title = `${companyName} CRM | Command Center`;

    const style = document.createElement('style');
    style.id = 'dynamic-theme-style';
    style.innerHTML = `
      :root {
        --color-primary: ${themeColor} !important;
        --color-secondary: ${themeColorSecondary} !important;
        --primary-theme-color: ${themeColor};
        --secondary-theme-color: ${themeColorSecondary};
      }
      
      /* Global elements overrides */
      .btn-primary:hover {
        background-color: color-mix(in srgb, var(--color-primary) 85%, black) !important;
        box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--color-primary) 30%, transparent) !important;
      }
      .btn-secondary:hover {
        background-color: color-mix(in srgb, var(--color-secondary) 85%, black) !important;
        box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--color-secondary) 30%, transparent) !important;
      }
      .input-field:focus {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent) !important;
      }

      /* Tailwind arbitrary class overrides for primary (#3f7abe) */
      .bg-\\[\\#3f7abe\\] {
        background-color: var(--primary-theme-color) !important;
      }
      .text-\\[\\#3f7abe\\] {
        color: var(--primary-theme-color) !important;
      }
      .border-\\[\\#3f7abe\\] {
        border-color: var(--primary-theme-color) !important;
      }
      .focus\\:border-\\[\\#3f7abe\\]:focus {
        border-color: var(--primary-theme-color) !important;
      }
      .hover\\:text-\\[\\#3f7abe\\]:hover {
        color: var(--primary-theme-color) !important;
      }
      .hover\\:bg-\\[\\#3f7abe\\]:hover {
        background-color: var(--primary-theme-color) !important;
      }
      .group:hover .group-hover\\:text-\\[\\#3f7abe\\] {
        color: var(--primary-theme-color) !important;
      }
      .hover\\:bg-\\[\\#33629c\\]:hover {
        background-color: color-mix(in srgb, var(--primary-theme-color) 85%, black) !important;
      }
      .bg-\\[\\#33629c\\] {
        background-color: color-mix(in srgb, var(--primary-theme-color) 85%, black) !important;
      }

      /* Primary shadow overrides */
      .shadow-\\[\\#3f7abe\\]\\/20 {
        --tw-shadow-color: color-mix(in srgb, var(--primary-theme-color) 20%, transparent) !important;
      }
      .shadow-\\[\\#3f7abe\\]\\/25 {
        --tw-shadow-color: color-mix(in srgb, var(--primary-theme-color) 25%, transparent) !important;
      }
      .shadow-\\[\\#3f7abe\\]\\/30 {
        --tw-shadow-color: color-mix(in srgb, var(--primary-theme-color) 30%, transparent) !important;
      }
      .shadow-\\[\\#3f7abe\\]\\/40 {
        --tw-shadow-color: color-mix(in srgb, var(--primary-theme-color) 40%, transparent) !important;
      }
      .shadow-xl\\/20 {
        --tw-shadow-color: var(--primary-theme-color) !important;
      }

      /* Primary opacity backgrounds / borders */
      .bg-\\[\\#3f7abe\\]\\/5 {
        background-color: color-mix(in srgb, var(--primary-theme-color) 5%, transparent) !important;
      }
      .bg-\\[\\#3f7abe\\]\\/10 {
        background-color: color-mix(in srgb, var(--primary-theme-color) 10%, transparent) !important;
      }
      .bg-\\[\\#3f7abe\\]\\/20 {
        background-color: color-mix(in srgb, var(--primary-theme-color) 20%, transparent) !important;
      }
      .border-\\[\\#3f7abe\\]\\/10 {
        border-color: color-mix(in srgb, var(--primary-theme-color) 10%, transparent) !important;
      }
      .border-\\[\\#3f7abe\\]\\/20 {
        border-color: color-mix(in srgb, var(--primary-theme-color) 20%, transparent) !important;
      }
      .selection\\:bg-\\[\\#3f7abe\\]\\/10::selection {
        background-color: color-mix(in srgb, var(--primary-theme-color) 10%, transparent) !important;
      }

      /* Tailwind arbitrary class overrides for secondary (#f6871e) */
      .bg-\\[\\#f6871e\\] {
        background-color: var(--secondary-theme-color) !important;
      }
      .text-\\[\\#f6871e\\] {
        color: var(--secondary-theme-color) !important;
      }
      .border-\\[\\#f6871e\\] {
        border-color: var(--secondary-theme-color) !important;
      }
      .focus\\:border-\\[\\#f6871e\\]:focus {
        border-color: var(--secondary-theme-color) !important;
      }
      .hover\\:text-\\[\\#f6871e\\]:hover {
        color: var(--secondary-theme-color) !important;
      }
      .hover\\:bg-\\[\\#f6871e\\]:hover {
        background-color: var(--secondary-theme-color) !important;
      }
      .group:hover .group-hover\\:text-\\[\\#f6871e\\] {
        color: var(--secondary-theme-color) !important;
      }
      .hover\\:bg-\\[\\#e0761a\\]:hover {
        background-color: color-mix(in srgb, var(--secondary-theme-color) 85%, black) !important;
      }
      .bg-\\[\\#e0761a\\] {
        background-color: color-mix(in srgb, var(--secondary-theme-color) 85%, black) !important;
      }

      /* Secondary gradients */
      .from-\\[\\#f6871e\\] {
        --tw-gradient-from: var(--secondary-theme-color) !important;
        --tw-gradient-to: color-mix(in srgb, var(--secondary-theme-color) 0%, transparent) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }
      .to-\\[\\#f6871e\\] {
        --tw-gradient-to: var(--secondary-theme-color) !important;
      }

      /* Secondary shadow overrides */
      .shadow-\\[\\#f6871e\\]\\/20 {
        --tw-shadow-color: color-mix(in srgb, var(--secondary-theme-color) 20%, transparent) !important;
      }
      .shadow-\\[\\#f6871e\\]\\/25 {
        --tw-shadow-color: color-mix(in srgb, var(--secondary-theme-color) 25%, transparent) !important;
      }
      .shadow-\\[\\#f6871e\\]\\/30 {
        --tw-shadow-color: color-mix(in srgb, var(--secondary-theme-color) 30%, transparent) !important;
      }
      .shadow-\\[\\#f6871e\\]\\/40 {
        --tw-shadow-color: color-mix(in srgb, var(--secondary-theme-color) 40%, transparent) !important;
      }

      /* Secondary opacity backgrounds / borders */
      .bg-\\[\\#f6871e\\]\\/5 {
        background-color: color-mix(in srgb, var(--secondary-theme-color) 5%, transparent) !important;
      }
      .bg-\\[\\#f6871e\\]\\/10 {
        background-color: color-mix(in srgb, var(--secondary-theme-color) 10%, transparent) !important;
      }
      .bg-\\[\\#f6871e\\]\\/20 {
        background-color: color-mix(in srgb, var(--secondary-theme-color) 20%, transparent) !important;
      }
      .border-\\[\\#f6871e\\]\\/10 {
        border-color: color-mix(in srgb, var(--secondary-theme-color) 10%, transparent) !important;
      }
      .border-\\[\\#f6871e\\]\\/20 {
        border-color: color-mix(in srgb, var(--secondary-theme-color) 20%, transparent) !important;
      }
    `;
    const existingStyle = document.getElementById('dynamic-theme-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, [user, themeColor, themeColorSecondary]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard/stats', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'staff', 'telecaller'] },
    { name: 'Admins', path: '/dashboard/superadmin/admins', icon: Shield, roles: ['superadmin'] },
    { name: 'Staff', path: '/dashboard/superadmin/staff', icon: Users, roles: ['superadmin'] },
    { name: 'Staff', path: '/dashboard/staff', icon: Users, roles: ['admin'] },
    { name: user?.role === 'telecaller' ? 'My Contacts' : 'Contacts', path: '/dashboard/contacts', icon: BookOpen, roles: ['admin', 'telecaller'] },
    { name: 'Contacts', path: '/dashboard/superadmin/contacts', icon: BookOpen, roles: ['superadmin'] },
    { name: 'Leads', path: '/dashboard/leads', icon: UserSquare2, roles: ['admin', 'staff'] },
    { name: 'Leads', path: '/dashboard/superadmin/leads', icon: UserSquare2, roles: ['superadmin'] },
    { name: 'Quotations', path: '/dashboard/quotations', icon: FileText, roles: ['admin', 'staff'] },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard, roles: ['admin', 'staff'] },
    { name: 'Payments', path: '/dashboard/superadmin/payments', icon: CreditCard, roles: ['superadmin'] },
    { name: 'Invoices', path: '/dashboard/invoices', icon: Receipt, roles: ['admin', 'staff'] },
    { name: 'Invoices', path: '/dashboard/superadmin/invoices', icon: Receipt, roles: ['superadmin'] },
    { name: 'Logs', path: '/dashboard/superadmin/logs', icon: Terminal, roles: ['superadmin'] },
    { name: 'Settings', path: '/dashboard/superadmin/settings', icon: Settings, roles: ['superadmin'] },
    { name: 'Company Settings', path: '/dashboard/company-settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));
  const bottomNavItems = filteredNav.slice(0, 5);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications`, config);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/notifications/read-all`, {}, config);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString('en-GB');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-[#3f7abe]/10">
      
      {/* Sidebar - Desktop & Tablet Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-300 flex flex-col
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 lg:w-20 -translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Section */}
        <div className="p-6 flex items-center gap-3">
          <img src={user?.companyDetails?.companyLogo || logo} alt="Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
          {isSidebarOpen && (
            <div className="flex flex-col truncate animate-in fade-in duration-500">
              <span className="text-sm font-black text-[#3f7abe] leading-none truncate max-w-[150px]">
                {user?.companyDetails?.companyName || 'Solar Hub'}
              </span>
              <span className="text-[8px] font-black text-[#f6871e] uppercase tracking-wider mt-1 opacity-90 truncate max-w-[150px]">
                {user?.companyDetails?.companySubHeader || 'Solar Command'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth <= 1024 && setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-[#3f7abe] text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#3f7abe]'}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#3f7abe]'}`} />
                {(isSidebarOpen || window.innerWidth <= 1024) && (
                  <span className="font-bold text-sm whitespace-nowrap tracking-tight">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#f6871e] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">{user?.name}</span>
                <span className="text-[10px] text-[#3f7abe] font-bold uppercase tracking-wider">
                  {user?.role === 'staff' ? 'consultant' : user?.role}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-all active:scale-95"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <img src={user?.companyDetails?.companyLogo || logo} alt="Logo" className="h-6 w-6 object-contain rounded" />
              <span className="font-black text-[#3f7abe] text-sm tracking-tight">
                {user?.companyDetails?.companyName || 'Solar Hub'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
             {/* Notification Bell with Dynamic Popover */}
             <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-[#3f7abe] text-white' : 'bg-slate-50 text-slate-400 hover:text-[#3f7abe]'}`}
                >
                   <Bell className="w-5 h-5" />
                   <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#f6871e] rounded-full border-2 border-white"></div>
                </button>
                
                 {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                       <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-[#f6871e] text-white text-[9px] font-bold rounded-full">{unreadCount} New</span>
                          )}
                       </div>
                       <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map(n => (
                              <div key={n._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-[#f6871e]' : 'bg-slate-200'}`}></div>
                                <div>
                                   <p className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                                   <p className="text-[10px] text-slate-600 mt-1 font-medium">{n.message}</p>
                                   <p className="text-[8px] text-slate-400 mt-1 font-black uppercase tracking-tighter">{getTimeAgo(n.createdAt)}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-10 text-center text-slate-400">
                               <Bell className="w-8 h-8 mx-auto mb-2 opacity-10" />
                               <p className="text-[10px] font-bold uppercase tracking-widest">No notifications yet</p>
                            </div>
                          )}
                       </div>
                       <button 
                         onClick={markAllRead}
                         className="w-full py-3 text-[10px] font-black text-[#3f7abe] uppercase tracking-widest hover:bg-slate-50 transition-colors border-t border-slate-50"
                       >
                          Mark All as Read
                       </button>
                    </div>
                 )}
             </div>

             <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>
             
             <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group" onClick={() => navigate('/dashboard/stats')}>
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-black text-slate-900 leading-none mb-1 group-hover:text-[#3f7abe] transition-colors">{user?.name}</p>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none flex items-center justify-end gap-1">
                      <Circle className="w-1.5 h-1.5 fill-current" /> Active
                   </p>
                </div>
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[#3f7abe] text-xs lg:text-sm group-hover:bg-[#3f7abe] group-hover:text-white transition-all shadow-sm">
                   {user?.name?.charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           {bottomNavItems.map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all
                   ${isActive ? 'text-[#3f7abe]' : 'text-slate-600'}
                 `}
               >
                 <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-[#3f7abe]/5 scale-110' : ''}`}>
                    <item.icon className="w-5 h-5" />
                 </div>
                 <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                   {item.name === 'Dashboard' ? 'Home' : item.name}
                 </span>
               </NavLink>
             );
           })}
        </nav>
      </main>
    </div>
  );
};

export default DashboardLayout;
