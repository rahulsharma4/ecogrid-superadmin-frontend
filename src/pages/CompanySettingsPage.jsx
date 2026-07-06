import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Building2, Save, Mail, Phone, MapPin, 
  CreditCard, Award, Image, Palette, HelpCircle, Loader2
} from 'lucide-react';

const CompanySettingsPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    themeColor: '#3f7abe',
    themeColorSecondary: '#f6871e',
    supportEmail: '',
    supportPhone: '',
    companyAddress: '',
    gstNumber: '',
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    companySeal: '',
    authorizedSignature: '',
    websiteUrl: '',
    upiId: '',
    payeeName: '',
    signatoryDesignation: 'Authorized Signatory',
    panNumber: '',
    companyShortName: 'SH',
    whatsappNumber: '',
    termsAndConditions: '',
    paymentQrCode: '',
    whatsappQrCode: '',
    companyTagline: 'Powering the Solar Revolution.',
    companyDescription: 'Access the Command Center to manage your sustainable energy infrastructure.',
    companySubHeader: 'Solar Command',
    fbPageId: '',
    fbPageName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
 
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/company-settings`, config);
      
      // Populate form with existing data, falling back to defaults if not set
      setFormData({
        companyName: data.companyName || 'Solar Hub',
        companyLogo: data.companyLogo || '',
        themeColor: data.themeColor || '#3f7abe',
        themeColorSecondary: data.themeColorSecondary || '#f6871e',
        supportEmail: data.supportEmail || 'support@solarhub.com',
        supportPhone: data.supportPhone || '+91-9999999999',
        companyAddress: data.companyAddress || '123 Green Energy Lane, New Delhi, India',
        gstNumber: data.gstNumber || '',
        bankName: data.bankName || '',
        bankAccountNo: data.bankAccountNo || '',
        bankIfsc: data.bankIfsc || '',
        companySeal: data.companySeal || '',
        authorizedSignature: data.authorizedSignature || '',
        websiteUrl: data.websiteUrl || 'www.solarhub.com',
        upiId: data.upiId || 'solarhub@upi',
        payeeName: data.payeeName || 'SOLAR HUB PRIVATE LIMITED',
        signatoryDesignation: data.signatoryDesignation || 'Authorized Signatory',
        panNumber: data.panNumber || '',
        companyShortName: data.companyShortName || 'SH',
        whatsappNumber: data.whatsappNumber || '+91-9999999999',
        termsAndConditions: data.termsAndConditions || '1. Interest @18% will be charged if payment is not made within due date.\n2. All disputes are subject to local jurisdiction.',
        paymentQrCode: data.paymentQrCode || '',
        whatsappQrCode: data.whatsappQrCode || '',
        companyTagline: data.companyTagline || 'Powering the Solar Revolution.',
        companyDescription: data.companyDescription || 'Access the Command Center to manage your sustainable energy infrastructure.',
        companySubHeader: data.companySubHeader || 'Solar Command',
        fbPageId: data.fbPageId || '',
        fbPageName: data.fbPageName || ''
      });
    } catch (err) {
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const [fbPages, setFbPages] = useState([]);
  const [showFbModal, setShowFbModal] = useState(false);
  const [selectedFbPageId, setSelectedFbPageId] = useState('');
  const [tempUserToken, setTempUserToken] = useState('');
  const [isConnectingFb, setIsConnectingFb] = useState(false);

  // Parse hash token on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setTempUserToken(token);
        fetchFbPages(token);
      }
      // Clean hash from URL
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  const fetchFbPages = async (token) => {
    const toastId = toast.loading('Fetching your Facebook Pages...');
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(`Meta API Error: ${data.error.message}`, { id: toastId });
        return;
      }

      if (!data.data || data.data.length === 0) {
        toast.error('No managed Facebook Pages found on this account.', { id: toastId });
        return;
      }

      setFbPages(data.data);
      setSelectedFbPageId(data.data[0].id);
      setShowFbModal(true);
      toast.dismiss(toastId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to query Facebook Pages.', { id: toastId });
    }
  };

  const handleConnectFbPage = async () => {
    if (!selectedFbPageId || !tempUserToken) return;
    setIsConnectingFb(true);
    const toastId = toast.loading('Linking Facebook page to your CRM...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/facebook/connect`, {
        userAccessToken: tempUserToken,
        selectedPageId: selectedFbPageId
      }, config);

      toast.success(data.message || 'Page linked successfully!', { id: toastId });
      
      setFormData(prev => ({
        ...prev,
        fbPageId: data.companyDetails.fbPageId,
        fbPageName: data.companyDetails.fbPageName
      }));

      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      if (storedUser) {
        storedUser.companyDetails = data.companyDetails;
        localStorage.setItem('userInfo', JSON.stringify(storedUser));
      }
      
      setShowFbModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Connection failed: ' + msg, { id: toastId });
    } finally {
      setIsConnectingFb(false);
    }
  };

  const handleDisconnectFb = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Facebook Page? Leads will stop syncing.')) return;
    const toastId = toast.loading('Disconnecting page...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/facebook/disconnect`, {}, config);

      toast.success(data.message, { id: toastId });

      setFormData(prev => ({
        ...prev,
        fbPageId: '',
        fbPageName: ''
      }));

      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      if (storedUser) {
        storedUser.companyDetails = data.companyDetails;
        localStorage.setItem('userInfo', JSON.stringify(storedUser));
      }
    } catch (err) {
      toast.error('Failed to disconnect Facebook page', { id: toastId });
    }
  };

  const handleStartFbLogin = () => {
    const clientId = import.meta.env.VITE_FB_APP_ID || '1599602048832259';
    const redirectUri = encodeURIComponent(window.location.origin + '/dashboard/company-settings');
    const scope = 'pages_read_engagement,pages_show_list,leads_retrieval,pages_manage_metadata';
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;
    window.location.href = authUrl;
  };


  useEffect(() => {
    fetchSettings();
  }, [user.token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error('Image size must be less than 1.5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Syncing customized company settings...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/company-settings`, formData, config);
      
      // Update local storage so that layout updates branding dynamically
      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      if (storedUser) {
        storedUser.companyDetails = data.companyDetails;
        localStorage.setItem('userInfo', JSON.stringify(storedUser));
        
        // Force state reload or trigger a reload. Wait, reload is easiest, or just alert them!
        toast.success('Company settings saved successfully! Page reloading to apply branding...', { id: loadingToast });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.success('Company settings updated successfully!', { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Branding Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#3f7abe]/10 text-[#3f7abe] flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">White-Label Company Settings</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure company profiles, invoices, signatures, colors, and UPI details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Settings panels grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel 1: Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Trade Name</label>
                  <input 
                    type="text" 
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g. Solar Hub"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Short Name / Prefix</label>
                  <input 
                    type="text" 
                    name="companyShortName"
                    required
                    value={formData.companyShortName}
                    onChange={handleInputChange}
                    placeholder="e.g. SH"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                  <input 
                    type="text" 
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. www.mycompany.com"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                  <input 
                    type="email" 
                    name="supportEmail"
                    required
                    value={formData.supportEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. billing@company.com"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Phone</label>
                  <input 
                    type="text" 
                    name="supportPhone"
                    required
                    value={formData.supportPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9999999999"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Contact Number</label>
                  <input 
                    type="text" 
                    name="whatsappNumber"
                    required
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9999999999"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Identification Number (GSTIN)</label>
                  <input 
                    type="text" 
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 07AAAAA1111A1Z1"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Card Number</label>
                  <input 
                    type="text" 
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sidebar Sub-Header Tagline</label>
                  <input 
                    type="text" 
                    name="companySubHeader"
                    required
                    value={formData.companySubHeader}
                    onChange={handleInputChange}
                    placeholder="e.g. Solar Command"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Page Slogan/Tagline</label>
                  <input 
                    type="text" 
                    name="companyTagline"
                    required
                    value={formData.companyTagline}
                    onChange={handleInputChange}
                    placeholder="e.g. Powering the Solar Revolution."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Page Detailed Description</label>
                  <input 
                    type="text" 
                    name="companyDescription"
                    required
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    placeholder="e.g. Access the Command Center to manage your sustainable energy infrastructure."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Address</label>
                  <textarea 
                    name="companyAddress"
                    required
                    rows={2}
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. Sector-62, Noida, UP, India"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Terms & Conditions</label>
                  <textarea 
                    name="termsAndConditions"
                    required
                    rows={3}
                    value={formData.termsAndConditions}
                    onChange={handleInputChange}
                    placeholder="Provide standard terms, one per line..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Invoicing & UPI Settlement Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI VPA ID (for QR Generation)</label>
                  <input 
                    type="text" 
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="e.g. merchant@pnb or phonepe"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI Payee Descriptor Name</label>
                  <input 
                    type="text" 
                    name="payeeName"
                    value={formData.payeeName}
                    onChange={handleInputChange}
                    placeholder="e.g. MY SOLAR PVT LTD"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Settlement Bank Name</label>
                  <input 
                    type="text" 
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g. Punjab National Bank"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Account Number</label>
                  <input 
                    type="text" 
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                    placeholder="e.g. 1029302920202"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank IFSC Code</label>
                  <input 
                    type="text" 
                    name="bankIfsc"
                    value={formData.bankIfsc}
                    onChange={handleInputChange}
                    placeholder="e.g. PUNB0638800"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Lead Ads Integration */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Social Media Integrations</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                Connect your Meta (Facebook & Instagram) Page to automatically import leads from your Lead Ads campaigns.
              </p>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                {formData.fbPageId ? (
                  <>
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px] font-black uppercase tracking-wider">Connected</span>
                      <h4 className="text-xs font-black text-slate-900 mt-1 uppercase tracking-wide">Connected Page: <span className="text-[#3f7abe]">{formData.fbPageName}</span></h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Page ID: {formData.fbPageId}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleDisconnectFb}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                    >
                      Disconnect Page
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">Not Integrated</span>
                      <h4 className="text-xs font-black text-slate-800 mt-1 uppercase tracking-wide">Sync Meta Ads Campaigns</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Integrate Facebook Forms in 1-Click</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleStartFbLogin}
                      className="px-6 py-3 bg-[#1877f2] hover:bg-[#145dbf] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                    >
                      Connect Facebook Page
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Panel 2: Visual customization (Logo, seal, color) */}
          <div className="space-y-6">
            
            {/* Color & Logo */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Interface Theme</h3>
              
              {/* Theme Colors Pickers */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-400" /> Primary Theme Color (Blue)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="themeColor"
                      value={formData.themeColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 outline-none"
                    />
                    <input 
                      type="text" 
                      name="themeColor"
                      value={formData.themeColor}
                      onChange={handleInputChange}
                      placeholder="#3f7abe"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-400" /> Secondary Accent Color (Orange)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      name="themeColorSecondary"
                      value={formData.themeColorSecondary}
                      onChange={handleInputChange}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 outline-none"
                    />
                    <input 
                      type="text" 
                      name="themeColorSecondary"
                      value={formData.themeColorSecondary}
                      onChange={handleInputChange}
                      placeholder="#f6871e"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Company Logo Upload */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-slate-400" /> Company Logo (256x256)
                </label>
                {formData.companyLogo ? (
                  <div className="relative group w-28 h-28 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                    <img src={formData.companyLogo} alt="Company Logo" className="w-full h-full object-contain p-2" />
                    <button 
                      type="button" 
                      onClick={() => handleClearImage('companyLogo')}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#3f7abe] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'companyLogo')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <Building2 className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upload PNG/JPG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoicing customization: Seal & Signature */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-3">Invoice Sign & Stamp</h3>
              
              {/* Company Stamp / Seal */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Round Seal / Stamp Image
                </label>
                {formData.companySeal ? (
                  <div className="relative group w-24 h-24 border border-slate-100 rounded-full overflow-hidden shadow-inner flex items-center justify-center p-2 bg-slate-55">
                    <img src={formData.companySeal} alt="Seal Stamp" className="w-full h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => handleClearImage('companySeal')}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-full w-24 h-24 flex flex-col justify-center items-center text-center hover:border-[#3f7abe] transition-colors relative mx-auto">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'companySeal')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <Award className="w-5 h-5 text-slate-300 mb-1" />
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Stamp</p>
                  </div>
                )}
              </div>

              {/* Authorized Signature */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Authorized Signature Image
                </label>
                {formData.authorizedSignature ? (
                  <div className="relative group w-full h-16 border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-55">
                    <img src={formData.authorizedSignature} alt="Signature" className="w-full h-full object-contain p-1" />
                    <button 
                      type="button" 
                      onClick={() => handleClearImage('authorizedSignature')}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove Signature
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-[#3f7abe] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'authorizedSignature')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Upload Signature PNG</p>
                  </div>
                )}
              </div>

              {/* Payment UPI QR Code */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-slate-400" /> Payment UPI QR Code Image (Static)
                </label>
                {formData.paymentQrCode ? (
                  <div className="relative group w-32 h-32 border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-55 mx-auto">
                    <img src={formData.paymentQrCode} alt="Payment QR Code" className="w-full h-full object-contain p-2" />
                    <button 
                      type="button" 
                      onClick={() => handleClearImage('paymentQrCode')}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove QR
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-[#3f7abe] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'paymentQrCode')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Upload static QR Code image</p>
                  </div>
                )}
              </div>

              {/* WhatsApp QR Code */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-slate-400" /> WhatsApp Contact QR Code Image (Static)
                </label>
                {formData.whatsappQrCode ? (
                  <div className="relative group w-32 h-32 border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-55 mx-auto">
                    <img src={formData.whatsappQrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain p-2" />
                    <button 
                      type="button" 
                      onClick={() => handleClearImage('whatsappQrCode')}
                      className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove QR
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-[#3f7abe] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'whatsappQrCode')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Upload static WhatsApp QR Image</p>
                  </div>
                )}
              </div>

              {/* Signatory Designation */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Signatory Designation</label>
                <input 
                  type="text" 
                  name="signatoryDesignation"
                  required
                  value={formData.signatoryDesignation}
                  onChange={handleInputChange}
                  placeholder="e.g. Authorized Signatory or Director"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button 
            type="submit"
            disabled={saving}
            className="bg-[#3f7abe] hover:bg-[#33629c] text-white px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#3f7abe]/25 transition-all active:scale-95 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Apply Dynamic Branding
          </button>
        </div>

      </form>

      {/* Facebook Page Selection Modal */}
      {showFbModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Select Facebook Page</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Select the page you want to connect to receive Lead Ads data in near real-time.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Facebook Pages</label>
              <select
                value={selectedFbPageId}
                onChange={(e) => setSelectedFbPageId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all text-xs font-bold text-slate-950"
              >
                {fbPages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.name} (ID: {page.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFbModal(false)}
                className="px-5 py-3 border-2 border-slate-100 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectFbPage}
                disabled={isConnectingFb || !selectedFbPageId}
                className="px-6 py-3 bg-[#3f7abe] hover:bg-[#33629c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                {isConnectingFb && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Link Page
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanySettingsPage;
