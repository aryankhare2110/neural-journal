'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useJournalStore } from '@/store/useJournalStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultMode }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const setUser = useJournalStore((s) => s.setUser);
  const supabase = createClient();

  // Sync modal state with the button the user clicked
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError(null);
      setMessage(null);
      setEmail('');
      setPassword('');
    }
  }, [isOpen, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the confirmation link.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setUser(data.user);
        const store = useJournalStore.getState();
        await store.fetchEntries();
        store.setViewState('Transitioning');
        setTimeout(() => {
          store.setViewState('Network_View');
        }, 800);
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          {/* Backdrop — click to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* ── Modal Card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative overflow-hidden"
            style={{
              width: '92%',
              maxWidth: 440,
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(8,8,14,0.88)',
              backdropFilter: 'blur(40px) saturate(1.4)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
              /* KEY: generous uniform padding like the reference */
              padding: '48px 44px 40px',
            }}
          >
            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-500/10 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute z-20 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white transition-all"
              style={{ top: 20, right: 20, width: 32, height: 32 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* ── Content ── */}
            <div className="relative z-10">

              {/* ── Header block ── */}
              {/* Title: large, white, centered */}
              <h2
                className="text-center font-semibold text-white"
                style={{ fontSize: 24, letterSpacing: '0.04em', marginBottom: 8 }}
              >
                {mode === 'login' ? 'Log in' : 'Sign up'}
              </h2>
              {/* Subtitle: small, muted, centered — 8px below title */}
              <p
                className="text-center text-white/35"
                style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 36 }}
              >
                {mode === 'login'
                  ? 'Log in to your account and seamlessly continue mapping your neural pathways.'
                  : 'Create your neural map and begin charting your consciousness.'}
              </p>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit}>

                {/* Email input — icon + placeholder inline, no label */}
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all focus-within:border-violet-500/40 focus-within:bg-white/[0.05]"
                  style={{ padding: '0 20px', height: 52, marginBottom: 14 }}
                >
                  <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 outline-none"
                    style={{ fontSize: 13 }}
                  />
                </div>

                {/* Password input */}
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all focus-within:border-violet-500/40 focus-within:bg-white/[0.05]"
                  style={{ padding: '0 20px', height: 52, marginBottom: 0 }}
                >
                  <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                    className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 outline-none"
                    style={{ fontSize: 13 }}
                  />
                </div>

                {/* Error / success messages */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 font-mono"
                      style={{ fontSize: 11, marginTop: 14 }}
                    >
                      {error}
                    </motion.p>
                  )}
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-emerald-400 font-mono"
                      style={{ fontSize: 11, marginTop: 14 }}
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button — 32px below last input */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    marginTop: 32,
                    height: 52,
                    fontSize: 14,
                    letterSpacing: '0.02em',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  {loading
                    ? 'Processing...'
                    : mode === 'login'
                      ? 'Log in'
                      : 'Sign up'}
                </button>
              </form>

              {/* ── Bottom toggle link — 28px below button ── */}
              <p
                className="text-center text-white/30"
                style={{ fontSize: 12, marginTop: 28 }}
              >
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  style={{ fontSize: 12 }}
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
