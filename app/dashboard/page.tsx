'use client';

import React, { useState, useRef, useEffect } from 'react';
import ARIADashboard from '@/components/ARIADashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getDefaultProgress, UserProgress } from '@/lib/progress';

interface Message { role: 'user' | 'assistant'; content: string; }

function ARIAChat({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm ARIA, your insurance exam coach. Ask me anything about your Wisconsin Life Insurance exam — concepts, practice questions, or study tips." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], userId }),
      });
      const data = await res.json();
      const reply = data.message || data.response || 'Sorry, I had trouble responding. Try again!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#1A1008', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', height: 560 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9874F, #7B3910)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>A</div>
            <div>
              <div style={{ color: '#EDE0D4', fontWeight: 600, fontSize: 15 }}>Talk to ARIA</div>
              <div style={{ color: '#EDE0D4', opacity: 0.4, fontSize: 12 }}>AI Exam Coach</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(237,224,212,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                background: m.role === 'user' ? 'linear-gradient(135deg, #C9874F, #A0522D)' : 'rgba(255,255,255,0.06)',
                color: '#EDE0D4', fontSize: 14, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'rgba(237,224,212,0.5)', fontSize: 14 }}>
                ARIA is thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask ARIA anything…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', color: '#EDE0D4', fontSize: 14, outline: 'none' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{ padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #C9874F, #A0522D)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [ariaOpen, setAriaOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    loadProgress(user.id);
  }, [user, authLoading]);

  async function loadProgress(userId: string) {
    setProgressLoading(true);
    const { data } = await supabase
      .from('aria_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setProgress(data as UserProgress);
    } else {
      // First time user — create default progress row
      const defaults = getDefaultProgress(userId);
      await supabase.from('aria_progress').insert(defaults);
      setProgress(defaults);
    }
    setProgressLoading(false);
  }

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
        <div className="text-[#EDE0D4]/40 text-sm">Loading your dashboard…</div>
      </div>
    );
  }

  if (!user || !progress) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0F0A07', color: '#EDE0D4' }}>
      {/* User nav bar */}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 50, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'rgba(237,224,212,0.5)' }}>{user.email}</span>
        <button
          onClick={signOut}
          style={{ fontSize: 12, color: 'rgba(237,224,212,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      <ARIADashboard
        userProgress={progress}
        onStartQuiz={() => window.location.href = '/quiz'}
        onViewFullSchedule={() => window.location.href = '/study-plan'}
        onOpenARIA={() => setAriaOpen(true)}
      />
      {ariaOpen && <ARIAChat userId={user.id} onClose={() => setAriaOpen(false)} />}
    </div>
  );
}
