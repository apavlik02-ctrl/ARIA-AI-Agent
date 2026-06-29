'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { UserProgress } from '@/lib/progress';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

const EXAM_TYPES = ['Life & Health', 'Life Only', 'Health Only', 'Property & Casualty'];

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [examDate, setExamDate] = useState('');
  const [state, setState] = useState('Wisconsin');
  const [examType, setExamType] = useState('Life & Health');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = '/login'; return; }

    supabase
      .from('aria_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.exam_date) setExamDate(data.exam_date);
        setLoading(false);
      });
  }, [user, authLoading]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !examDate) return;
    setSaving(true);
    setError('');

    const { error: err } = await supabase
      .from('aria_progress')
      .update({ exam_date: examDate, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);

    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setPwError(err.message);
    } else {
      setPwSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSaved(false), 3000);
    }
    setPwSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
        <div className="text-[#EDE0D4]/40 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '12px 16px', color: '#EDE0D4', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: 'rgba(237,224,212,0.6)', marginBottom: 8,
  };

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4]">
      <header className="border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold">A</div>
            <div className="text-xl font-semibold tracking-[3px]">ARIA</div>
          </a>
          <a href="/dashboard" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-[#EDE0D4]/60 hover:text-[#EDE0D4] transition-colors px-2">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-1">Settings</h1>
        <p className="text-[#EDE0D4]/50 mb-10 text-sm">{user.email}</p>

        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,135,79,0.15)', borderRadius: 20, padding: '28px 24px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#C9874F', marginBottom: 20 }}>Exam Settings</h2>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Exam date</label>
              <input
                type="date"
                value={examDate}
                min={minDateStr}
                onChange={e => setExamDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>State</label>
              <select value={state} onChange={e => setState(e.target.value)} style={inputStyle}>
                {US_STATES.map(s => <option key={s} value={s} style={{ background: '#1A1008' }}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>License type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EXAM_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExamType(type)}
                    style={{
                      padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: 14,
                      background: examType === type ? 'rgba(201,135,79,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${examType === type ? '#C9874F' : 'rgba(255,255,255,0.1)'}`,
                      color: examType === type ? '#C9874F' : '#EDE0D4',
                      cursor: 'pointer',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              type="submit"
              disabled={saving || !examDate}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #C9874F, #A0522D)',
                border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none',
                color: saved ? '#4ade80' : 'white',
                fontSize: 15, fontWeight: 500, cursor: saving || !examDate ? 'not-allowed' : 'pointer',
                opacity: saving || !examDate ? 0.6 : 1,
              }}
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#EDE0D4', marginBottom: 20 }}>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={inputStyle}
              />
            </div>

            {pwError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{pwError}</p>}

            <button
              type="submit"
              disabled={pwSaving || !newPassword}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: pwSaved ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
                border: pwSaved ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.15)',
                color: pwSaved ? '#4ade80' : '#EDE0D4',
                fontSize: 15, fontWeight: 500, cursor: pwSaving || !newPassword ? 'not-allowed' : 'pointer',
                opacity: pwSaving || !newPassword ? 0.5 : 1,
              }}
            >
              {pwSaved ? '✓ Password updated' : pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#EDE0D4', marginBottom: 6 }}>Account</h2>
          <p style={{ fontSize: 13, color: 'rgba(237,224,212,0.4)', marginBottom: 16 }}>Signed in as {user.email}</p>
          <button
            onClick={signOut}
            className="w-full sm:w-auto"
            style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}
