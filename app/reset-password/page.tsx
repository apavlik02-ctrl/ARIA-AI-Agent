'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase redirects with the session embedded in the URL hash.
    // onAuthStateChange fires with PASSWORD_RECOVERY when the hash is processed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 flex items-center">
          <a href="/" className="min-h-[44px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-lg">A</div>
            <div className="text-2xl font-semibold tracking-[3px]">ARIA</div>
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-md">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">✓</div>
              <h2 className="text-2xl font-semibold mb-3">Password updated</h2>
              <p className="text-[#EDE0D4]/60 mb-8">Your password has been changed. You can now log in.</p>
              <a
                href="/dashboard"
                className="inline-block px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all"
              >
                Go to dashboard
              </a>
            </div>
          ) : !ready ? (
            <div className="text-center text-[#EDE0D4]/40 text-sm">Verifying reset link…</div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold mb-2">Set a new password</h1>
              <p className="text-[#EDE0D4]/60 mb-8">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
