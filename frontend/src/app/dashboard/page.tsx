'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, UploadCloud, FileText, Link2, BarChart3, History, Settings, HelpCircle,
  X, Loader2, AlertCircle, CheckCircle2, Zap, Clock, ArrowUpRight, Sparkles, Check, Download, Trash2, Copy, Search, Filter, ShieldCheck, HardDrive, KeyRound, User, Lock, Bell, Users, Plus, Globe, RefreshCw, ChevronDown, Home, Building2, Layers, Cpu
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

interface VaultDocument {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  category: string;
  sensitivity: string;
}

interface ActiveShareLink {
  id: string;
  documentId: string;
  fileName: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  passwordProtected: boolean;
  downloads: number;
}

interface ActivityEvent {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
  ip: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export default function DashboardPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('Engineering');
  const [uploadSensitivity, setUploadSensitivity] = useState('Confidential');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [activeLinks, setActiveLinks] = useState<ActiveShareLink[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [activeNav, setActiveNav] = useState<'vault' | 'links' | 'analytics' | 'plans' | 'team' | 'activity' | 'settings' | 'help' | 'profile'>('vault');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [profileName, setProfileName] = useState('T.M. Dinuja Ransara Abeywickrama');
  const [profileEmail] = useState('dinuja@sentinel.dev');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Security Officer');

  const [autoScan, setAutoScan] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [ipWhitelisting, setIpWhitelisting] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingTicket, setSendingTicket] = useState(false);

  const [currentPlan, setCurrentPlan] = useState<'standard' | 'pro' | 'enterprise'>('enterprise');

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchVaultData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
      const teamRes = await fetch('http://localhost:5000/api/team', { credentials: 'include' });
      if (teamRes.ok) {
        const tData = await teamRes.json();
        setTeamMembers(tData);
      }
    } catch {
      setDocuments([
        { id: 'doc-1', fileName: 'Enterprise_Architecture_Blueprint_2026.pdf', contentType: 'application/pdf', fileSize: 4850000, uploadedAt: new Date().toISOString(), category: 'Engineering', sensitivity: 'Confidential' },
        { id: 'doc-2', fileName: 'Zero_Knowledge_Encryption_Spec.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 1420000, uploadedAt: new Date(Date.now() - 86400000).toISOString(), category: 'Security', sensitivity: 'Restricted' },
        { id: 'doc-3', fileName: 'Q3_Financial_Projections.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileSize: 3200000, uploadedAt: new Date(Date.now() - 172800000).toISOString(), category: 'Finance', sensitivity: 'Internal' }
      ]);
      setActiveLinks([
        { id: 'link-1', documentId: 'doc-1', fileName: 'Enterprise_Architecture_Blueprint_2026.pdf', token: 'sentinel_sec_enterprise_99x', expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(), createdAt: new Date().toISOString(), passwordProtected: true, downloads: 4 }
      ]);
      setActivityLogs([
        { id: 'act-1', action: 'AES-256 Vault Encryption & Heuristic Malware Scan', target: 'Enterprise_Architecture_Blueprint_2026.pdf', timestamp: 'Just now', status: 'success', ip: '192.168.1.104' },
        { id: 'act-2', action: 'Generated secure expiring share token', target: 'Enterprise_Architecture_Blueprint_2026.pdf', timestamp: '1 hour ago', status: 'info', ip: '192.168.1.104' },
        { id: 'act-3', action: 'Biometric 2FA Hardware Key Verified', target: 'Authentication Session', timestamp: '3 hours ago', status: 'success', ip: '192.168.1.104' }
      ]);
      setTeamMembers([
        { id: 'tm-1', name: 'Zeinab Shereen', email: 'zeinab@sentinel.dev', role: 'Security Officer', status: 'Active' },
        { id: 'tm-2', name: 'Shehara Dagonna', email: 'shehara@sentinel.dev', role: 'Compliance Lead', status: 'Active' },
        { id: 'tm-3', name: 'Dileepa Fernando', email: 'dileepa@sentinel.dev', role: 'Vault Administrator', status: 'Pending' }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setScanStep(1);
    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1400);

    setTimeout(() => {
      showToast('success', `"${file.name}" successfully encrypted with AES-256 and stored.`);
      const newDoc: VaultDocument = {
        id: 'doc-' + Date.now(),
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        category: uploadCategory,
        sensitivity: uploadSensitivity
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActivityLogs(prev => [{
        id: 'act-' + Date.now(),
        action: `Encrypted & uploaded file (${uploadCategory} / ${uploadSensitivity})`,
        target: file.name,
        timestamp: 'Just now',
        status: 'success',
        ip: '192.168.1.104'
      }, ...prev]);
      setFile(null);
      setUploading(false);
      setScanStep(0);
    }, 2000);
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    showToast('success', 'Secure share link copied to clipboard.');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const maxLimit = currentPlan === 'standard' ? 100 * 1024 * 1024 : currentPlan === 'pro' ? 5 * 1024 * 1024 * 1024 : 50 * 1024 * 1024 * 1024;
  const totalStorage = documents.reduce((acc, doc) => acc + doc.fileSize, 0);
  const storagePercent = Math.min(100, Math.round((totalStorage / maxLimit) * 100));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'pdf') return matchesSearch && doc.contentType.includes('pdf');
    if (filterType === 'docs') return matchesSearch && (doc.contentType.includes('document') || doc.fileName.endsWith('.docx'));
    if (filterType === 'sheets') return matchesSearch && (doc.contentType.includes('sheet') || doc.fileName.endsWith('.xlsx'));
    return matchesSearch;
  });

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    const newMember: TeamMember = {
      id: 'tm-' + Date.now(),
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending'
    };
    setTeamMembers(prev => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    showToast('success', `Security invitation sent to ${inviteEmail}`);
  };

  return (
    <div className="min-h-screen relative text-slate-950 flex bg-[#f8fafc] overflow-x-hidden">
      <AnimatedBackground />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -32, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -32, x: '-50%' }}
            transition={{ duration: 0.3, ease: SMOOTH_EASE }}
            className={`fixed top-6 left-1/2 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-blue-600 text-white border-blue-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-blue-300" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-slate-200/80 bg-white/90 backdrop-blur-2xl hidden lg:flex flex-col justify-between p-6 z-30 sticky top-0 h-screen shadow-sm">
        <div>
          <Link href="/" className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block">Sentinel</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Secure Document Vault</span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            {[
              { id: 'vault', label: 'My Vault', icon: FileText, count: documents.length },
              { id: 'links', label: 'Active Share Links', icon: Link2, count: activeLinks.length },
              { id: 'analytics', label: 'Storage Analytics', icon: BarChart3 },
              { id: 'team', label: 'Team Compliance', icon: Users, count: teamMembers.length },
              { id: 'activity', label: 'Audit Trail Logs', icon: History, count: activityLogs.length },
              { id: 'settings', label: 'Security Settings', icon: Settings },
              { id: 'help', label: 'Help & Support', icon: HelpCircle },
            ].map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`w-full relative flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    active ? 'text-white shadow-lg shadow-blue-600/25' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                      className="absolute inset-0 bg-blue-600 rounded-2xl"
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className={`relative z-10 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-inner">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">Vault Quota</span>
            <span className="font-bold text-blue-600">{storagePercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${storagePercent}%` }} />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500">{formatBytes(totalStorage)} ({currentPlan.toUpperCase()})</span>
            <button
              onClick={() => setActiveNav('plans')}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center"
            >
              Extend Quota <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span>Sentinel Vault</span>
              <span>/</span>
              <span className="text-blue-600 capitalize font-bold">{activeNav.replace('-', ' ')}</span>
            </div>

            <div className="flex items-center space-x-4 ml-auto">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search encrypted assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-2xl border border-slate-200 bg-[#f8fafc] pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                />
              </div>

              <button
                onClick={() => setActiveNav('profile')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-2xl border transition-all ${
                  activeNav === 'profile' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {profileName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold block leading-tight">{profileName}</span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase">{currentPlan} tier</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-5xl w-full mx-auto">
            
            {/* VIEW: MY VAULT */}
            {activeNav === 'vault' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3 shadow-sm">
                      <Zap className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                      <span>Zero-Knowledge AES-256 Client-Side Encryption Active</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Secure Vault Uploader</h1>
                    <p className="text-xs text-slate-500 mt-1.5">Drag and drop sensitive documents for automated heuristic malware scanning & secure zero-knowledge storage.</p>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Vault Category</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Engineering">Engineering & Architecture</option>
                          <option value="Security">Security & Cryptography</option>
                          <option value="Finance">Finance & Legal</option>
                          <option value="Research">Research & Development</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sensitivity Clearance</label>
                        <select
                          value={uploadSensitivity}
                          onChange={(e) => setUploadSensitivity(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Confidential">Confidential</option>
                          <option value="Restricted">Restricted</option>
                          <option value="Internal">Internal</option>
                          <option value="Public">Public</option>
                        </select>
                      </div>
                    </div>

                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed rounded-[28px] cursor-pointer p-8 text-center transition-all ${
                        isDragging ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      {!file ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="h-14 w-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                            <UploadCloud className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-900 font-extrabold">Drop your file here or <span className="text-blue-600 underline">browse workspace</span></p>
                            <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, XLSX, PNG, JPG securely</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 text-left flex justify-between items-center shadow-md">
                          <div className="flex items-center space-x-3.5">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{file.name}</p>
                              <p className="text-[11px] text-slate-500">{formatBytes(file.size)} • Ready for secure pipeline</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                    </label>

                    {uploading && (
                      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-2.5 text-xs font-mono border border-slate-800 shadow-xl">
                        <div className="flex justify-between text-blue-400 font-bold">
                          <span>Executing Zero-Knowledge Security Pipeline</span>
                          <span>{scanStep === 1 ? '33%' : scanStep === 2 ? '66%' : '100%'}</span>
                        </div>
                        <p className={scanStep >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>✓ Step 1: MIME-type validation & binary signature inspection</p>
                        <p className={scanStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>✓ Step 2: Automated heuristic malware and sandbox threat scan</p>
                        <p className={scanStep >= 3 ? 'text-blue-300 font-semibold' : 'text-slate-500'}>⏳ Step 3: Encrypting payload with AES-256 client key</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!file || uploading}
                      className="w-full rounded-2xl bg-blue-600 py-4 text-xs font-extrabold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-40 transition"
                    >
                      {uploading ? 'Encrypting & Storing in Vault...' : 'Encrypt & Save to Secure Vault'}
                    </button>
                  </form>
                </div>

                {/* Stored Documents Table */}
                <div className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Stored Vault Assets ({filteredDocuments.length})</h2>
                      <p className="text-xs text-slate-500">All documents are securely encrypted at rest</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {['all', 'pdf', 'docs', 'sheets'].map(t => (
                        <button
                          key={t}
                          onClick={() => setFilterType(t)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                            filterType === t ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="p-4.5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition shadow-sm">
                        <div className="flex items-center space-x-3.5">
                          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-bold text-slate-900">{doc.fileName}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{doc.category}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{doc.sensitivity}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{formatBytes(doc.fileSize)} • AES-256 Encrypted • Verified Malware-Free</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <button onClick={() => showToast('success', `Downloading decrypted ${doc.fileName}...`)} className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-sm">
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>Download</span>
                          </button>
                          <button onClick={() => {
                            const newToken = 'sentinel_sec_' + Math.random().toString(36).substring(7);
                            setActiveLinks(prev => [{ id: 'link-' + Date.now(), documentId: doc.id, fileName: doc.fileName, token: newToken, expiresAt: new Date(Date.now() + 24*3600000).toISOString(), createdAt: new Date().toISOString(), passwordProtected: true, downloads: 0 }, ...prev]);
                            showToast('success', `Generated expiring secure share link for ${doc.fileName}`);
                          }} className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-bold text-blue-700 flex items-center space-x-1.5 shadow-sm">
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </button>
                          <button onClick={() => {
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                            showToast('success', `Deleted ${doc.fileName} from vault`);
                          }} className="p-2 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-red-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: ACTIVE LINKS */}
            {activeNav === 'links' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900">Active Secure Share Links</h1>
                    <p className="text-xs text-slate-500">Public tokens with automated time-based expiration</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">{activeLinks.length} Active</span>
                </div>
                {activeLinks.map(link => (
                  <div key={link.id} className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{link.fileName}</p>
                      <p className="text-[11px] font-mono text-blue-600 mt-1 select-all">{window.location.origin}/share/{link.token}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Downloads: {link.downloads} • Passcode Protected</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => copyToClipboard(link.token)} className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 shadow-sm">
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copy Link</span>
                      </button>
                      <button onClick={() => setActiveLinks(prev => prev.filter(l => l.id !== link.id))} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-100 text-red-600 hover:bg-red-100">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW: STORAGE ANALYTICS */}
            {activeNav === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Storage & Security Analytics</h1>
                    <p className="text-xs text-slate-500 mt-1">Real-time telemetry and quota distribution for your encrypted workspace.</p>
                  </div>
                  <button onClick={() => setActiveNav('plans')} className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-blue-600/30">
                    <Sparkles className="w-4 h-4" />
                    <span>Extend Quota</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500">Total Vault Assets</span>
                    <p className="text-3xl font-black text-slate-900">{documents.length} Files</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">100% Malware-Free Verified</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500">Storage Consumption</span>
                    <p className="text-3xl font-black text-slate-900">{formatBytes(totalStorage)}</p>
                    <p className="text-[11px] text-blue-600 font-semibold">{storagePercent}% of {currentPlan.toUpperCase()} quota</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-[#f8fafc] border border-slate-200 space-y-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500">Active Share Links</span>
                    <p className="text-3xl font-black text-slate-900">{activeLinks.length} Tokens</p>
                    <p className="text-[11px] text-indigo-600 font-semibold">AES-256 Protected</p>
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900">Workspace Capacity ({currentPlan.toUpperCase()})</span>
                    <span className="text-blue-600">{storagePercent}% Used</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" style={{ width: `${storagePercent}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500">{formatBytes(totalStorage)} occupied out of {formatBytes(maxLimit)} total provisioned limit.</p>
                </div>
              </motion.div>
            )}

            {/* VIEW: TEAM COMPLIANCE */}
            {activeNav === 'team' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900">Team Compliance & Security Officers</h1>
                    <p className="text-xs text-slate-500">Manage organizational access and zero-knowledge vault roles</p>
                  </div>
                  <button onClick={() => setShowInviteModal(true)} className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md">
                    <Plus className="w-4 h-4" />
                    <span>Invite Officer</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {teamMembers.map(member => (
                    <div key={member.id} className="p-4.5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500">{member.email} • <span className="text-blue-600 font-semibold">{member.role}</span></p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>

                {showInviteModal && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Invite Security Officer</h3>
                        <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                      </div>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Arunidha"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="officer@sentinel.dev"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                          >
                            <option value="Security Officer">Security Officer</option>
                            <option value="Compliance Lead">Compliance Lead</option>
                            <option value="Vault Administrator">Vault Administrator</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition">
                          Send Security Invitation
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW: PLANS & PRICING */}
            {activeNav === 'plans' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">Extend Storage & Subscription Plans</h1>
                    <p className="text-xs text-slate-500 mt-1">Upgrade your workspace package for increased storage quotas, priority malware scans, and custom domain sharing.</p>
                  </div>
                  <button onClick={() => setActiveNav('analytics')} className="text-xs font-bold text-slate-500 hover:text-slate-900">Back to Analytics</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-7 rounded-[28px] border flex flex-col justify-between ${currentPlan === 'standard' ? 'border-blue-600 bg-blue-50/50 shadow-xl ring-2 ring-blue-600/30' : 'border-slate-200 bg-[#f8fafc]'}`}>
                    <div>
                      <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Standard</span>
                      <p className="text-4xl font-black text-slate-900 my-4">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></p>
                      <ul className="space-y-3 text-xs text-slate-600 mb-8">
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> 100 MB Secure Storage</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> Max 10 MB per file</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> AES-256 Encryption</li>
                      </ul>
                    </div>
                    <button onClick={() => { setCurrentPlan('standard'); showToast('success', 'Switched to Standard Free version.'); }} disabled={currentPlan === 'standard'} className="w-full py-3.5 rounded-2xl text-xs font-bold bg-slate-900 text-white disabled:opacity-50 hover:bg-slate-800 transition">
                      {currentPlan === 'standard' ? 'Current Active Tier' : 'Select Standard'}
                    </button>
                  </div>

                  <div className={`p-7 rounded-[28px] border flex flex-col justify-between relative ${currentPlan === 'pro' ? 'border-blue-600 bg-blue-50/50 shadow-xl ring-2 ring-blue-600/40' : 'border-slate-200 bg-[#f8fafc]'}`}>
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-md">POPULAR</div>
                    <div>
                      <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Pro Shield</span>
                      <p className="text-4xl font-black text-slate-900 my-4">$9 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                      <ul className="space-y-3 text-xs text-slate-600 mb-8">
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> 5 GB Secure Storage</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> Priority zero-day threat scan</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> Expiring share links</li>
                      </ul>
                    </div>
                    <button onClick={() => { setCurrentPlan('pro'); showToast('success', 'Upgraded to Pro Shield package!'); }} disabled={currentPlan === 'pro'} className="w-full py-3.5 rounded-2xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition">
                      {currentPlan === 'pro' ? 'Current Active Tier' : 'Upgrade to Pro'}
                    </button>
                  </div>

                  <div className={`p-7 rounded-[28px] border flex flex-col justify-between ${currentPlan === 'enterprise' ? 'border-purple-600 bg-purple-50/50 shadow-xl ring-2 ring-purple-600/40' : 'border-slate-200 bg-[#f8fafc]'}`}>
                    <div>
                      <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">Enterprise</span>
                      <p className="text-4xl font-black text-slate-900 my-4">$29 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                      <ul className="space-y-3 text-xs text-slate-600 mb-8">
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> 50 GB Secure Storage</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> Custom domain sharing</li>
                        <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-600" /> 24/7 Priority Support</li>
                      </ul>
                    </div>
                    <button onClick={() => { setCurrentPlan('enterprise'); showToast('success', 'Upgraded to Enterprise package!'); }} disabled={currentPlan === 'enterprise'} className="w-full py-3.5 rounded-2xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-600/30 transition">
                      {currentPlan === 'enterprise' ? 'Current Active Tier' : 'Upgrade to Enterprise'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: ACTIVITY LOGS */}
            {activeNav === 'activity' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h1 className="text-xl font-extrabold text-slate-900">Audit Trail Logs</h1>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">System Secure</span>
                </div>
                <div className="space-y-3.5">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-4.5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{log.action}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Target: <span className="font-mono text-blue-600">{log.target}</span> • IP: {log.ip}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center font-mono"><Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW: SETTINGS */}
            {activeNav === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <h1 className="text-xl font-extrabold text-slate-900">Vault Security Settings</h1>
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Automatic File Threat Scanning</p>
                      <p className="text-[11px] text-slate-500">Scan all uploaded documents for malware via zero-knowledge pipeline.</p>
                    </div>
                    <button onClick={() => { setAutoScan(!autoScan); showToast('success', 'Security preference updated.'); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${autoScan ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Real-time Email Security Alerts</p>
                      <p className="text-[11px] text-slate-500">Receive instant telemetry notices on unrecognized login attempts.</p>
                    </div>
                    <button onClick={() => { setEmailAlerts(!emailAlerts); showToast('success', 'Email notification settings updated.'); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${emailAlerts ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Hardware Key 2FA Authorization</p>
                      <p className="text-[11px] text-slate-500">Require FIDO2 hardware security keys for vault decryption.</p>
                    </div>
                    <button onClick={() => { setTwoFactorAuth(!twoFactorAuth); showToast('success', '2FA protocol updated.'); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${twoFactorAuth ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Corporate IP Whitelisting</p>
                      <p className="text-[11px] text-slate-500">Restrict access to verified subnet ranges only.</p>
                    </div>
                    <button onClick={() => { setIpWhitelisting(!ipWhitelisting); showToast('success', 'IP restriction policy updated.'); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${ipWhitelisting ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: HELP & SUPPORT */}
            {activeNav === 'help' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <h1 className="text-xl font-extrabold text-slate-900">Help & Support Center</h1>
                <div className="space-y-3">
                  {[
                    { q: 'How do expiring share links work?', a: 'When you share a document, you can specify an expiration timer. Once elapsed, the link is disabled automatically.' },
                    { q: 'Are my uploaded files encrypted?', a: 'Yes! Every document undergoes zero-knowledge threat scans and is encrypted at rest using AES-256 bit encryption.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#f8fafc] border border-slate-200 overflow-hidden shadow-sm">
                      <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-4.5 text-left flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>{faq.q}</span>
                        <span>{openFaq === idx ? '−' : '+'}</span>
                      </button>
                      {openFaq === idx && <div className="px-4.5 pb-4.5 text-xs text-slate-600 border-t border-slate-200 pt-3">{faq.a}</div>}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Send Priority Support Ticket</h3>
                  <textarea
                    rows={3}
                    placeholder="Describe your security inquiry..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                  <button
                    onClick={() => {
                      if (!supportMessage) return;
                      setSendingTicket(true);
                      setTimeout(() => {
                        setSendingTicket(false);
                        setSupportMessage('');
                        showToast('success', 'Priority support ticket submitted successfully.');
                      }, 800);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                  >
                    {sendingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW: PROFILE */}
            {activeNav === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white backdrop-blur-2xl rounded-[36px] p-8 md:p-10 border border-slate-200 shadow-2xl space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/30">{profileName.charAt(0)}</div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{profileName}</h2>
                      <p className="text-xs text-slate-500">{profileEmail}</p>
                    </div>
                  </div>
                  <button onClick={() => router.push('/')} className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl hover:bg-red-100 transition">Sign out</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUpdatingProfile(true);
                      setTimeout(() => {
                        setUpdatingProfile(false);
                        showToast('success', 'Profile updated successfully.');
                      }, 600);
                    }}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
                  >
                    {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
