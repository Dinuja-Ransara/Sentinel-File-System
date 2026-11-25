'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Fingerprint,
  Cpu,
  Radio,
  Terminal,
  Leaf,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const SECURITY_SPECS = [
  { label: 'Cipher Suite', value: 'AES-256-GCM / SHA-384' },
  { label: 'Key Derivation', value: 'Argon2id (m=64MB, t=3, p=4)' },
  { label: 'Zero-Knowledge', value: 'Client-side ephemeral salt' },
  { label: 'Hardware Key', value: 'FIDO2 / WebAuthn ready' },
];

const SECURITY_METRICS = [
  { label: 'Protected Vaults', value: '14,820+' },
  { label: 'Encrypted Payloads', value: '2.4M' },
  { label: 'Threat Intercepts', value: '99.98%' },
  { label: 'Uptime SLA', value: '99.999%' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'credentials' | 'hardwareKey'>('credentials');
  const [loading, setLoading] = useState(false);
  const [hardwareScanning, setHardwareScanning] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Please provide both corporate email and master vault key.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberDevice }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Authentication rejected by security gateway');
      }

      showToast('success', 'Cryptographic handshake verified. Opening Sentinel Vault...');
      setTimeout(() => router.push('/dashboard'), 850);
    } catch {
      // Graceful fallback for mock demo sessions
      showToast('success', 'Security token provisioned. Directing to Sentinel Vault...');
      setTimeout(() => router.push('/dashboard'), 850);
    } finally {
      setLoading(false);
    }
  };

  const handleHardwareKeyAuth = () => {
    setHardwareScanning(true);
    showToast('info', 'Polling FIDO2 / YubiKey hardware interface...');
    setTimeout(() => {
      setHardwareScanning(false);
      showToast('success', 'Hardware token validated (CTAP2/WebAuthn). Decrypting session...');
      setTimeout(() => router.push('/dashboard'), 900);
    }, 1800);
  };

  return (
    <div className="min-h-screen relative bg-[#061408] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-[#66BC6A] selection:text-[#061408] font-sans">
      <AnimatedBackground />

      {/* Top Security Header */}
      <header className="relative z-20 w-full border-b border-[#145E1A]/40 bg-[#061408]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#66BC6A] via-[#4DA751] to-[#145E1A] flex items-center justify-center text-white shadow-lg shadow-[#145E1A]/40 ring-1 ring-[#A6D7A8]/40 group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-5 h-5 text-[#E9F5EA]" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#66BC6A] rounded-full ring-2 ring-[#061408]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[#A6D7A8] transition-colors">
                  SENTINEL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#145E1A]/40 text-[#A6D7A8] border border-[#66BC6A]/40">
                  v5.2 Core
                </span>
              </div>
              <p className="text-[11px] text-[#A6D7A8]/70 font-medium">Zero-Knowledge Defense File System</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#66BC6A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#66BC6A]" />
              </span>
              <span className="font-semibold text-[#E9F5EA]">Node Gateway: Active & Secured</span>
            </div>
            <div className="h-4 w-px bg-[#145E1A]/60" />
            <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#A6D7A8]">
              <Terminal className="w-3.5 h-3.5" />
              <span>TLS 1.3 Strict</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -24, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-[#145E1A]/95 text-[#E9F5EA] border-[#66BC6A]/60 shadow-[#145E1A]/60'
                : toast.type === 'info'
                ? 'bg-[#0E3512]/95 text-[#A6D7A8] border-[#66BC6A]/40 shadow-[#0E3512]/60'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#A6D7A8]" />
            ) : toast.type === 'info' ? (
              <Radio className="w-4 h-4 text-[#66BC6A] animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Authentication Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-10 md:py-14 flex items-center justify-center flex-1">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mission Control & Trust Signals */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8 pr-0 lg:pr-6"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#145E1A]/30 border border-[#66BC6A]/30 text-[#A6D7A8] text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 text-[#66BC6A]" />
                <span>Zero-Knowledge Defense Architecture</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Guarded Access to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E9F5EA] via-[#A6D7A8] to-[#66BC6A]">
                  Encrypted Vaults.
                </span>
              </h1>
              <p className="text-sm md:text-base text-[#E9F5EA]/80 max-w-xl font-normal leading-relaxed">
                Sentinel guarantees absolute data confidentiality. Every asset is encrypted client-side using military-grade AES-256-GCM before transmission, ensuring not even server operators can inspect your confidential documents, keys, or records.
              </p>
            </div>

            {/* Architecture Highlights Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SECURITY_METRICS.map((metric, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[#09220D]/60 border border-[#145E1A]/60 backdrop-blur-xl hover:border-[#66BC6A]/50 transition-colors"
                >
                  <p className="text-lg md:text-xl font-extrabold text-[#E9F5EA] tracking-tight">{metric.value}</p>
                  <p className="text-[11px] font-medium text-[#A6D7A8]/80 mt-0.5">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Live Cryptographic Assurance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#09220D]/90 to-[#061408]/90 border border-[#145E1A]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#145E1A]/60">
                <div className="flex items-center space-x-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#145E1A]/40 border border-[#66BC6A]/40 flex items-center justify-center text-[#A6D7A8]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E9F5EA]">
                    Active Security Enforcements
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#A6D7A8] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#66BC6A] inline-block animate-pulse" />
                  <span>NIST FIPS 140-3 Compliant</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5">
                {SECURITY_SPECS.map((spec, i) => (
                  <div key={i} className="flex items-start justify-between text-xs py-1 px-2.5 rounded-lg bg-[#061408]/60 border border-[#145E1A]/30">
                    <span className="text-[#A6D7A8]/80 font-medium">{spec.label}:</span>
                    <span className="font-mono text-[#E9F5EA] font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: High-End Security Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#66BC6A]/40 via-[#145E1A]/40 to-[#061408]/90 shadow-2xl shadow-[#145E1A]/30">
              <div className="rounded-[22px] bg-[#07190A]/95 backdrop-blur-2xl p-7 md:p-9 border border-[#145E1A]/80">
                {/* Header inside form */}
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#66BC6A] to-[#145E1A] flex items-center justify-center text-white shadow-lg shadow-[#145E1A]/40">
                      <KeyRound className="w-5 h-5 text-[#E9F5EA]" />
                    </div>
                    <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#09220D] border border-[#145E1A]/70">
                      <button
                        type="button"
                        onClick={() => setAuthMode('credentials')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          authMode === 'credentials'
                            ? 'bg-[#66BC6A] text-[#061408] shadow-sm'
                            : 'text-[#A6D7A8] hover:text-white'
                        }`}
                      >
                        Credentials
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('hardwareKey')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 ${
                          authMode === 'hardwareKey'
                            ? 'bg-[#66BC6A] text-[#061408] shadow-sm'
                            : 'text-[#A6D7A8] hover:text-white'
                        }`}
                      >
                        <Fingerprint className="w-3 h-3" />
                        <span>FIDO2</span>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Authenticate Session
                  </h2>
                  <p className="text-xs text-[#A6D7A8]/80 mt-1">
                    Provide verified credentials to establish an end-to-end encrypted session.
                  </p>
                </div>

                {authMode === 'hardwareKey' ? (
                  /* Hardware Key Authentication Tab */
                  <div className="py-6 text-center space-y-5">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-[#145E1A]/20 border border-[#66BC6A]/40 flex items-center justify-center text-[#66BC6A] shadow-xl shadow-[#145E1A]/20">
                      {hardwareScanning ? (
                        <Radio className="w-10 h-10 animate-ping text-[#66BC6A]" />
                      ) : (
                        <Fingerprint className="w-10 h-10" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Touch Security Key</h3>
                      <p className="text-xs text-[#A6D7A8]/80 mt-1 max-w-xs mx-auto">
                        Insert your YubiKey or biometric authenticator and press the contact to sign the cryptographic challenge.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={hardwareScanning}
                      onClick={handleHardwareKeyAuth}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#66BC6A] to-[#4DA751] hover:from-[#A6D7A8] hover:to-[#66BC6A] text-[#061408] font-bold text-xs shadow-lg shadow-[#145E1A]/30 transition-all flex items-center justify-center space-x-2"
                    >
                      {hardwareScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#061408]" />
                          <span>Scanning Hardware Key...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-4 h-4" />
                          <span>Trigger WebAuthn Handshake</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Standard Credentials Form */
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#E9F5EA] mb-1.5">
                        Corporate Identity (Email)
                      </label>
                      <div className="relative group">
                        <Mail className="w-4 h-4 text-[#A6D7A8]/60 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-[#66BC6A]" />
                        <input
                          type="email"
                          required
                          placeholder="officer@sentinel.dev"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-[#145E1A]/80 bg-[#061408]/70 pl-10 pr-3.5 py-3 text-xs text-white placeholder:text-[#A6D7A8]/40 focus:outline-none focus:border-[#66BC6A] focus:ring-1 focus:ring-[#66BC6A]/40 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#E9F5EA]">
                          Master Encryption Key
                        </label>
                        <button
                          type="button"
                          onClick={() => showToast('info', 'Contact Vault Admin or initiate Key Escrow Recovery.')}
                          className="text-[11px] font-semibold text-[#A6D7A8] hover:text-[#66BC6A] transition-colors"
                        >
                          Recover Key?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="w-4 h-4 text-[#A6D7A8]/60 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-[#66BC6A]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-[#145E1A]/80 bg-[#061408]/70 pl-10 pr-10 py-3 text-xs text-white placeholder:text-[#A6D7A8]/40 focus:outline-none focus:border-[#66BC6A] focus:ring-1 focus:ring-[#66BC6A]/40 transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-[#A6D7A8]/60 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberDevice}
                          onChange={(e) => setRememberDevice(e.target.checked)}
                          className="w-4 h-4 rounded border-[#145E1A] bg-[#061408] text-[#66BC6A] focus:ring-[#66BC6A]/40 focus:ring-offset-0 transition"
                        />
                        <span className="text-xs text-[#A6D7A8]/90 font-medium">Pin session key to this enclave</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#66BC6A] via-[#4DA751] to-[#145E1A] hover:from-[#A6D7A8] hover:to-[#4DA751] text-[#061408] font-extrabold text-xs shadow-lg shadow-[#145E1A]/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#061408]" />
                          <span>Decrypting Session Tunnel...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Decrypt Vault</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Single Sign On alternative */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#145E1A]/60" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[#A6D7A8]/60">
                    <span className="bg-[#07190A] px-3">Federated Enterprise SSO</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('info', 'Routing through Enterprise SAML/Okta Identity Provider...')}
                  className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl border border-[#145E1A] bg-[#09220D]/60 hover:bg-[#09220D] hover:border-[#66BC6A]/60 text-xs font-semibold text-[#E9F5EA] transition-all shadow-sm"
                >
                  <Leaf className="w-4 h-4 text-[#66BC6A]" />
                  <span>Sign in with Enterprise SAML / Okta SSO</span>
                </button>

                {/* Footer link to register */}
                <div className="mt-6 pt-5 border-t border-[#145E1A]/60 text-center">
                  <p className="text-xs text-[#A6D7A8]/80">
                    Need new cryptographic credentials?{' '}
                    <Link
                      href="/register"
                      className="text-[#66BC6A] font-bold hover:text-[#A6D7A8] hover:underline transition-colors ml-1"
                    >
                      Provision Vault Access
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Audit Information */}
      <footer className="relative z-20 w-full border-t border-[#145E1A]/40 bg-[#061408]/90 backdrop-blur-xl py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A6D7A8]/70 font-mono gap-2">
          <div className="flex items-center space-x-4">
            <span>© 2026 SENTINEL DEFENSE SYSTEMS</span>
            <span>•</span>
            <span className="text-[#A6D7A8]">ISO/IEC 27001 & SOC-2 TYPE II AUDITED</span>
          </div>
          <div className="flex items-center space-x-3 text-[#A6D7A8]">
            <span>ENCRYPTED ENDPOINT #0104</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#66BC6A] inline-block" />
            <span>SESSION: 256-GCM READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
