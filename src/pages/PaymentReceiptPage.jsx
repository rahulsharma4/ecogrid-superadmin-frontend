import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Loader2,
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImg from '../assets/Logo.jpeg';
import sealImg from '../assets/SealImg.jpeg';

const PaymentReceiptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  const [sealBase64, setSealBase64] = useState('');
  const [sigBase64, setSigBase64] = useState('');
  const [projectSummary, setProjectSummary] = useState({
    systemSize: 'N/A',
    solarPanels: 'N/A',
    inverter: 'N/A'
  });
  const receiptRef = useRef();

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };
    
    return convert(num);
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Booking-Receipt-${payment?._id.slice(-6).toUpperCase()}.pdf`);

      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      console.error('PDF Error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Fetch Logo
        if (user?.companyDetails?.companyLogo) {
          setLogoBase64(user.companyDetails.companyLogo);
        } else {
          const logoResp = await fetch(logoImg);
          const logoBlob = await logoResp.blob();
          const logoReader = new FileReader();
          logoReader.onloadend = () => setLogoBase64(logoReader.result);
          logoReader.readAsDataURL(logoBlob);
        }

        // Fetch Seal
        if (user?.companyDetails?.companySeal) {
          setSealBase64(user.companyDetails.companySeal);
        } else {
          const sealResp = await fetch(sealImg);
          const sealBlob = await sealResp.blob();
          const sealReader = new FileReader();
          sealReader.onloadend = () => setSealBase64(sealReader.result);
          sealReader.readAsDataURL(sealBlob);
        }

        // Fetch Signature
        if (user?.companyDetails?.authorizedSignature) {
          setSigBase64(user.companyDetails.authorizedSignature);
        }
      } catch (err) { console.error(err); }
    };
    fetchAssets();

    const fetchPayment = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payments`, config);
        const found = data.find(p => p._id === id);
        setPayment(found);

        if (found && found.leadId) {
          const leadId = found.leadId._id || found.leadId;
          try {
            // Try fetching invoices first
            const { data: invoices } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices`, config);
            const matchingInvoice = invoices.find(inv => {
              const invLeadId = inv.lead?._id || inv.lead;
              return invLeadId === leadId;
            });

            if (matchingInvoice) {
              setProjectSummary({
                systemSize: matchingInvoice.systemSize || 'N/A',
                solarPanels: matchingInvoice.solarPanels || 'N/A',
                inverter: matchingInvoice.inverter || 'N/A'
              });
            } else {
              // Try fetching quotations if invoice not found
              const { data: quotations } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations`, config);
              const matchingQuotation = quotations.find(q => {
                const qLeadId = q.lead?._id || q.lead;
                return qLeadId === leadId;
              });

              if (matchingQuotation) {
                setProjectSummary({
                  systemSize: matchingQuotation.systemSize || 'N/A',
                  solarPanels: matchingQuotation.solarPanels || 'N/A',
                  inverter: matchingQuotation.inverter || 'N/A'
                });
              }
            }
          } catch (fetchErr) {
            console.error('Error fetching project summary details:', fetchErr);
          }
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchPayment();
  }, [id, user.token, user?.companyDetails]);

  useEffect(() => {
    if (!loading && payment) {
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(handleDownload, 1000);
      }
    }
  }, [loading, payment, location.search]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Pixel-Perfect Receipt...</p>
    </div>
  );
  if (!payment) return <div className="text-center py-20 font-bold text-slate-400">Receipt not found</div>;

  const summary = {
    total: payment.leadId?.quotationAmount || 230000,
    advance: payment.amount || 0,
    balance: (payment.leadId?.quotationAmount || 230000) - (payment.amount || 0)
  };

  const primaryThemeColor = user?.companyDetails?.themeColor || '#3f7abe';

  const s = {
    container: { width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#1e293b', textAlign: 'left', position: 'relative' },
    header: { backgroundColor: primaryThemeColor, padding: '30px 40px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    logoBox: { backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', display: 'inline-block' },
    bookingBadge: { border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '10px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    bar: { backgroundColor: '#f1f5f9', padding: '15px 40px', borderBottom: `2px solid ${primaryThemeColor}`, display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#64748b' },
    amountSection: { backgroundColor: primaryThemeColor, padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' },
    main: { padding: '40px' },
    sectionTitle: { fontSize: '12px', fontWeight: '900', color: primaryThemeColor, borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    detailsGrid: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '12px', marginBottom: '30px' },
    label: { color: '#64748b', fontWeight: '600' },
    value: { color: '#0f172a', fontWeight: '700' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: primaryThemeColor, color: '#ffffff', padding: '12px 15px', textAlign: 'left', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '12px', fontWeight: '700', color: '#334155' },
    summarySection: { marginTop: '40px', maxWidth: '350px', marginLeft: 'auto' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px', fontWeight: '700' },
    balanceRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', fontWeight: '900', borderTop: `2px solid ${user?.companyDetails?.themeColorSecondary || '#f6871e'}`, marginTop: '5px', color: user?.companyDetails?.themeColorSecondary || '#f6871e' },
    footer: { position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: primaryThemeColor, padding: '12px 40px', color: '#ffffff', textAlign: 'center', fontSize: '9px', fontWeight: '600', opacity: 0.9 },
    stamp: { width: '80px', height: '80px', borderRadius: '50%', border: `2px dashed ${primaryThemeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, margin: '20px auto 10px auto' }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 overflow-x-hidden print:p-0 print:bg-white">
      <div className="flex items-center justify-between max-w-[850px] mx-auto mb-8 px-4 print:hidden">
        <button onClick={() => navigate('/dashboard/payments')} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <button 
            disabled={isDownloading}
            onClick={handleDownload}
            style={{ backgroundColor: primaryThemeColor }}
            className="flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:opacity-90 transition-all"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
             Print
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div ref={receiptRef} style={s.container} className="shadow-2xl print:shadow-none">
           {/* Header */}
           <div style={s.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                 <div style={s.logoBox}>
                    {logoBase64 && <img src={logoBase64} alt="Logo" style={{ height: '55px' }} />}
                 </div>
                 <div style={{ maxWidth: '400px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '0', letterSpacing: '-0.02em' }}>{user?.companyDetails?.companyName || 'SOLAR HUB PRIVATE LIMITED'}</h1>
                    <p style={{ fontSize: '9px', marginTop: '6px', opacity: 0.8, lineHeight: '1.5', fontWeight: '500' }}>
                      {user?.companyDetails?.companyAddress || '123 Green Energy Lane, New Delhi, India'}
                      <br/>
                      GSTIN: {user?.companyDetails?.gstNumber || 'N/A'}
                    </p>
                 </div>
              </div>
              <div style={s.bookingBadge}>
                 <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0', letterSpacing: '0.1em' }}>BOOKING</h2>
                 <p style={{ fontSize: '8px', margin: '4px 0 0 0', opacity: 0.7 }}>Booking Receipt</p>
              </div>
           </div>

           {/* Info Bar */}
           <div style={s.bar}>
              <div style={{ display: 'flex', gap: '5px' }}>BOOKING NO: <span style={{ color: primaryThemeColor }}>BK-{payment._id.slice(-6).toUpperCase()}</span></div>
              <div style={{ display: 'flex', gap: '5px' }}>DATE: <span style={{ color: primaryThemeColor }}>{new Date(payment.createdAt).toLocaleDateString('en-GB')}</span></div>
              <div style={{ display: 'flex', gap: '5px' }}>STATUS: <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>CONFIRMED</span></div>
           </div>

           {/* Amount Highlight */}
           <div style={s.amountSection}>
              <div>
                 <p style={{ fontSize: '10px', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Advance Amount Received</p>
                 <p style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, fontStyle: 'italic' }}>Rupees {numberToWords(payment.amount)} Only</p>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '900' }}>₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
           </div>

           {/* Customer Details */}
           <div style={s.main}>
              <h3 style={s.sectionTitle}>Customer Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', fontSize: '11px', fontWeight: '700' }}>
                    <div style={{ color: '#64748b' }}>Name</div><div style={{ color: '#0f172a' }}>{payment.leadId?.name?.toUpperCase() || 'SURAJ KUMAR YADAV'}</div>
                    <div style={{ color: '#64748b' }}>Phone</div><div style={{ color: '#0f172a' }}>{payment.leadId?.phone || '9876543210'}</div>
                    <div style={{ color: '#64748b' }}>Email</div><div style={{ color: '#0f172a' }}>{payment.leadId?.email || 'N/A'}</div>
                    <div style={{ color: '#64748b' }}>Address</div><div style={{ color: '#0f172a', lineHeight: '1.4' }}>{payment.leadId?.address?.toUpperCase() || 'LUCKNOW UP'}</div>
                 </div>
                 <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Project Summary</p>
                    <p style={{ fontSize: '12px', fontWeight: '900', color: primaryThemeColor }}>{projectSummary.systemSize} SOLAR PV SYSTEM</p>
                    <p style={{ fontSize: '9px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>Panels: {projectSummary.solarPanels} | Inv: {projectSummary.inverter}</p>
                 </div>
              </div>

              {/* Table */}
              <h3 style={s.sectionTitle}>Order Details</h3>
              <table style={s.table}>
                 <thead>
                    <tr style={s.th}>
                       <th style={{ ...s.th, borderTopLeftRadius: '4px' }}>Description</th>
                       <th style={{ ...s.th, textAlign: 'center' }}>Payment Mode</th>
                       <th style={{ ...s.th, textAlign: 'center' }}>Reference</th>
                       <th style={{ ...s.th, textAlign: 'right', borderTopRightRadius: '4px' }}>Total Amount</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td style={s.td}>SOLAR INSTALLATION SYSTEM PROJECT</td>
                       <td style={{ ...s.td, textAlign: 'center' }}>{payment.paymentMode?.toUpperCase() || 'CASH'}</td>
                       <td style={{ ...s.td, textAlign: 'center', fontSize: '10px', lineHeight: '1.3' }}>
                          {(() => {
                             if (payment.paymentMode === 'Cheque') {
                                const fDate = payment.chequeDate ? new Date(payment.chequeDate).toLocaleDateString('en-GB') : '';
                                return (
                                   <div>
                                      <span style={{ fontWeight: '900' }}>No:</span> {payment.referenceNo}<br/>
                                      <span style={{ fontWeight: '900' }}>Bank:</span> {payment.bankName}<br/>
                                      {fDate && <><span style={{ fontWeight: '900' }}>Date:</span> {fDate}</>}
                                   </div>
                                );
                             } else if (payment.paymentMode === 'Bank Transfer') {
                                return (
                                   <div>
                                      <span style={{ fontWeight: '900' }}>UTR:</span> {payment.referenceNo}<br/>
                                      <span style={{ fontWeight: '900' }}>Bank:</span> {payment.bankName}
                                   </div>
                                );
                             }
                             return payment.referenceNo || '—';
                          })()}
                       </td>
                       <td style={{ ...s.td, textAlign: 'right' }}>₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                       <td colSpan="3" style={{ padding: '12px 15px', textAlign: 'right', fontSize: '11px', fontWeight: '900', color: primaryThemeColor }}>Total Order Amount</td>
                       <td style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '900', color: primaryThemeColor }}>₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                 </tbody>
              </table>

              {/* Summary Calculation */}
              <div style={s.summarySection}>
                 <div style={s.summaryRow}>
                    <span style={{ color: '#64748b' }}>Total Amount</span>
                    <span style={{ color: '#0f172a' }}>₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div style={{ ...s.summaryRow, color: '#166534' }}>
                    <span>Advance Received</span>
                    <span>(-) ₹{summary.advance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div style={s.balanceRow}>
                    <span>Balance Due</span>
                    <span>₹{summary.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                 </div>
              </div>
                       {/* Bottom Row: Bank Details & Signatory Section */}
              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 {user?.companyDetails?.bankAccountNo && (
                    <div style={{ width: '320px', textAlign: 'left' }}>
                       <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                          <p style={{ fontSize: '8px', fontWeight: '900', color: '#0369a1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Remittance</p>
                          <p style={{ fontSize: '9px', fontWeight: '800', color: primaryThemeColor, lineHeight: '1.4' }}>
                             {user?.companyDetails?.payeeName}<br/>
                             Bank: {user?.companyDetails?.bankName}<br/>
                             A/C No: {user?.companyDetails?.bankAccountNo}<br/>
                             IFSC Code: {user?.companyDetails?.bankIfsc}
                          </p>
                       </div>
                    </div>
                 )}
                 
                 <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: '11px', fontWeight: '900', color: primaryThemeColor, marginBottom: '25px', textTransform: 'uppercase' }}>For {user?.companyDetails?.companyName || 'SOLAR HUB PRIVATE LIMITED'}</p>
                    <div style={{ margin: '10px 0', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                       {sigBase64 && (
                          <img src={sigBase64} alt="Signature" style={{ height: '40px', objectFit: 'contain', marginBottom: '5px', marginLeft: 'auto' }} />
                       )}
                       {sealBase64 ? (
                          <img src={sealBase64} alt="Seal" style={{ width: '80px', height: '80px', objectFit: 'contain', marginLeft: 'auto' }} />
                       ) : (
                          <div style={{ width: '80px', height: '80px', border: `2px dashed ${primaryThemeColor}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 0 0 auto', padding: '10px' }}>
                             <div style={{ fontSize: '7px', fontWeight: '900', color: primaryThemeColor, opacity: 0.6, textAlign: 'center' }}>{user?.companyDetails?.companyName ? `${user.companyDetails.companyName.toUpperCase()}` : 'SOLAR HUB PVT LTD'}</div>
                             <div style={{ width: '30px', height: '1px', backgroundColor: primaryThemeColor, opacity: 0.2, margin: '3px 0' }}></div>
                             <div style={{ fontSize: '6px', fontWeight: '700', color: primaryThemeColor, opacity: 0.4 }}>CERTIFIED</div>
                          </div>
                       )}
                    </div>
                    <div style={{ borderTop: '1px solid #cbd5e1', width: '200px', marginLeft: 'auto', marginTop: '10px' }}></div>
                    <p style={{ fontSize: '9px', color: '#64748b', marginTop: '8px', fontWeight: '800', letterSpacing: '0.05em' }}>{user?.companyDetails?.signatoryDesignation || 'Authorized Signatory'}</p>
                 </div>
              </div>
           </div>

           {/* Sticky Footer */}
           <div style={s.footer}>
              <p style={{ margin: '0' }}>
                 Phone: {user?.companyDetails?.supportPhone || '+91-9999999999'} | Email: {user?.companyDetails?.supportEmail || 'support@solarhub.com'} | Web: {user?.companyDetails?.websiteUrl || 'www.solarhub.com'}
              </p>
              <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '8px' }}>
                 This is a computer-generated booking receipt. | GSTIN: {user?.companyDetails?.gstNumber || 'N/A'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPage;
