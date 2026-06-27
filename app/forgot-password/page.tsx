'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-6 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-lg">A</div>
            <div className="text-2xl font-semibold tracking-[3px]">ARIA</div>
          </a>
          <a href="/login" className="text-sm text-[#C9874F] hover:opacity-80 transition-opacity">
            Back to login →
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">✓</div>
              <h2 className="text-2xl font-semibold mb-3">Check your email</h2>
              <p className="text-[#EDE0D4]/60">
                We sent a password reset link to <strong>{email}</strong>. Click it to choose a new password.
              </p>
              <a href="/login" className="inline-block mt-8 text-sm text-[#C9874F] hover:opacity-80 transition-opacity">
                Back to login
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold mb-2">Forgot your password?</h1>
              <p className="text-[#EDE0D4]/60 mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors"
                    placeholder="you@example.com"
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
