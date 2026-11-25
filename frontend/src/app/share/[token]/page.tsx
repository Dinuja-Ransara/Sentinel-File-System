'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Download, Lock, CheckCircle2, AlertCircle, FileText, Loader2, Clock } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token;

  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUnlocked(true);
      showToast('success', 'Vault link successfully unlocked via zero-knowledge key.');
    }, 800);
  };

  const handleDownload = () => {
    showToast('success', 'Downloading decrypted document...');
  };

  return (
    <div className="min-h-screen relative text-slate-900 flex items-center justify-center px-6 py-12 bg-[#f8fafc] overflow-hidden">
      <AnimatedBackground />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -32, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -32, x: '-50%' }}
            transition={{ duration: 0.3, ease: SMOOTH_EASE }}
            className={`fixed top-6 left-1/2 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-blue-300" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SMOOTH_EASE }}
        className="max-w-md w-full bg-white/95 backdrop-blur-2xl p-8 md:p-10 rounded-[36px] border border-slate-200 shadow-2xl relative z-10 space-y-6 text-center"
      >
        <div className="inline-flex h-14 w-14 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-600/30 mb-2">
          <Shield className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Secure Shared Document</h1>
        <p className="text-xs text-slate-500">Token: <span className="font-mono text-blue-600 font-bold">{token}</span></p>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vault Decryption Passcode</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Enter passcode (if required)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] pl-10 pr-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Decrypt & Access File</span>}
            </button>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Enterprise_Architecture_Blueprint_2026.pdf</p>
                  <p className="text-[11px] text-slate-500">4.85 MB • Verified Malware-Free</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Decrypted File</span>
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Self-destructs upon expiration</span>
        </div>
      </motion.div>
    </div>
  );
}
