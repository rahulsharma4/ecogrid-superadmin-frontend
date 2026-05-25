import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Settings, Loader2, Save, Mail, AlertTriangle, 
  HelpCircle, Zap, ShieldAlert, CheckCircle2
} from 'lucide-react';

const SuperAdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewAdminRegistration: true,
    installationTargetkW: 1000,
    contactEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/superadmin/settings`, config);
      setSettings(data);
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user.token]);

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleNumberChange = (e) => {
    setSettings(prev => ({ ...prev, installationTargetkW: Number(e.target.value) }));
  };

  const handleEmailChange = (e) => {
    setSettings(prev => ({ ...prev, contactEmail: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Syncing security configurations...');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/superadmin/settings`, settings, config);
      setSettings(data);
      toast.success('System configurations successfully updated!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to save settings', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading configuration parameters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#3f7abe]" /> System Settings Configurator
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Manage global flags, maintenance lockouts, targets, and support contacts.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Settings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Security & Access Policies */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Access Policies</h3>

            {/* Toggle 1 */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase">Allow Admin Registration</h4>
                <p className="text-[10px] text-slate-500 font-medium">When disabled, public operators cannot request admin credentials from the registration page.</p>
              </div>
              
              <button 
                type="button"
                onClick={() => handleToggle('allowNewAdminRegistration')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.allowNewAdminRegistration ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.allowNewAdminRegistration ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  Maintenance Mode <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">Temporarily freeze all operational routes to run system maintenance, database backups, or node migration.</p>
              </div>
              
              <button 
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 shrink-0 ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </button>
            </div>

          </div>

          {/* Target Configs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Targets & Metadata</h3>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#3f7abe]" /> Target Solar capacity (kW)
              </label>
              <input 
                type="number"
                value={settings.installationTargetkW}
                onChange={handleNumberChange}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
              <p className="text-[9px] text-slate-400 font-medium mt-1 ml-1">Displayed as target bar on Super Admin command stats.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Support Contact Email
              </label>
              <input 
                type="email"
                value={settings.contactEmail}
                onChange={handleEmailChange}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-900"
              />
              <p className="text-[9px] text-slate-400 font-medium mt-1 ml-1">Default support contact email printed on operator screens.</p>
            </div>

          </div>

        </div>

        {/* Informational warning */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0" />
          <p className="text-[10px] text-orange-800 font-medium uppercase tracking-wide leading-relaxed">
            <strong>Warning:</strong> Toggling security switches affects real-time API routes immediately. Inactive modes are cached on the client but will fail authentication calls on next request.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="bg-[#3f7abe] hover:bg-[#33629c] text-white px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#3f7abe]/25 transition-all active:scale-95 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save System Configuration
          </button>
        </div>

      </form>

    </div>
  );
};

export default SuperAdminSettingsPage;
