'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2, LockKeyhole, Sparkles, Check } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro' | 'enterprise'>('enterprise');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('error', 'Please complete all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, plan: selectedPlan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }

      showToast('success', `Account created with ${selectedPlan.toUpperCase()} plan! Initializing...`);
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch {
      setTimeout(() => {
        showToast('success', `Mock account created (${selectedPlan.toUpperCase()} plan). Redirecting...`);
        setTimeout(() => router.push('/dashboard'), 1000);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-900 flex items-center justify-center px-6 py-12 bg-[#f8fafc] overflow-x-hidden">
      <AnimatedBackground />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -32, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -32, x: '-50%' }}
            transition={{ duration: 0.3, ease: SMOOTH_EASE }}
            className={`fixed top-6 left-1/2 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : toast.type === 'info' ? 'bg-blue-600 text-white border-blue-500' : 'bg-red-600 text-white border-red-500'
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
        className="max-w-4xl w-full bg-white/95 backdrop-blur-2xl rounded-[36px] border border-slate-200 shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
      >
        <div className="lg:col-span-7 p-8 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Choose Your Subscription Tier</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Select your package to initialize your workspace with the appropriate storage quota, payment plan, and threat scan privileges.
            </p>

            <div className="grid grid-cols-1 gap-3.5">
              {[
                { id: 'standard', name: 'Standard (Free)', price: '$0 / forever', desc: '100 MB Secure Storage • 10 MB per file limit' },
                { id: 'pro', name: 'Pro Shield', price: '$9 / month', desc: '5 GB Secure Storage • Priority zero-day threat scan' },
                { id: 'enterprise', name: 'Enterprise', price: '$29 / month', desc: '50 GB Secure Storage • Custom domains & 24/7 support' },
              ].map((p) => {
                const active = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPlan(p.id as any);
                      showToast('info', `Selected ${p.name} (${p.price}).`);
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      active ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/20' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        {active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Selected</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">{p.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Zero-Knowledge AES-256 Bit Encryption Guaranteed</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-3">
              <LockKeyhole className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
            <p className="text-xs text-slate-500 mt-1">Set up your secure vault workspace</p>
          </div>

          <button
            type="button"
            onClick={() => showToast('success', 'Redirecting to Google SSO authenticate...')}
            className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.14v3.15C3.15 21.3 7.23 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.14C.41 8.08 0 9.75 0 12s.41 3.92 1.14 5.4l4.14-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.7 1.14 6.6l4.14 3.15c.95-2.84 3.6-4.95 6.72-4.95z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">or email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="T.M. Dinuja Ransara Abeywickrama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="dinuja@sentinel.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account ({selectedPlan.toUpperCase()})</span>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
