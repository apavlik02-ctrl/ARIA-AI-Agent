'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production wire to an email service or Supabase table
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">✓</div>
          <h2 className="text-2xl font-semibold mb-3">Message sent!</h2>
          <p className="text-[#EDE0D4]/60 mb-6">We'll get back to you within 24 hours.</p>
          <a href="/" className="text-[#C9874F] hover:opacity-80 transition-opacity text-sm">← Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-6 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-lg">A</div>
            <div className="text-2xl font-semibold tracking-[3px]">ARIA</div>
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/login" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all">Log in</a>
            <a href="/signup" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all">Get started</a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-2">Contact us</h1>
          <p className="text-[#EDE0D4]/60 mb-8">Have a question? We'd love to hear from you.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EDE0D4]/70 mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#EDE0D4] placeholder-[#EDE0D4]/30 focus:outline-none focus:border-[#C9874F]/60 transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-sm text-[#EDE0D4]/50 space-y-2">
            <p>📧 support@ariacoach.ai</p>
            <p>⏱ Response time: within 24 hours</p>
          </div>
        </div>
      </main>
    </div>
  );
}
