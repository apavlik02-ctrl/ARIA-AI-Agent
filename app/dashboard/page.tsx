'use client';

import React, { useState, useRef, useEffect } from 'react';
import ARIADashboard from '@/components/ARIADashboard';
import OnboardingModal from '@/components/OnboardingModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getDefaultProgress, UserProgress } from '@/lib/progress';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_STARTERS = [
  'Give me a practice quiz',
  'Analyze my readiness',
  'What are grace periods?',
  'Create a study schedule',
];

function getSuggestions(reply: string): string[] {
  const lower = reply.toLowerCase();
  if (lower.includes('quiz') || lower.includes('question')) {
    return ['Show me another quiz', 'Explain that topic more', 'How am I doing overall?'];
  }
  if (lower.includes('readiness') || lower.includes('score') || lower.includes('%')) {
    return ['What should I focus on?', 'Give me a practice quiz', 'Create a study schedule'];
  }
  if (lower.includes('schedule') || lower.includes('plan')) {
    return ['Give me a practice quiz', 'Explain riders', 'What is a grace period?'];
  }
  return ['Give me a practice quiz', 'Analyze my readiness', 'Explain policy provisions'];
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'rgba(201,135,79,0.6)',
            animation: `aria-dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes aria-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ARIAChat({ userId, accessToken, onClose }: { userId: string; accessToken?: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm ARIA, your insurance exam coach. Ask me anything about your Wisconsin Life Insurance exam — concepts, practice questions, or study tips." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_STARTERS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    try {
      const res = await fetch('/api/aria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], userId, accessToken }),
      });
      const data = await res.json();
      const reply = data.message || data.response || 'Sorry, I had trouble responding. Try again!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setSuggestions(getSuggestions(reply));
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
      setSuggestions(QUICK_STARTERS);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#1A1008', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', height: 580 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9874F, #7B3910)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>A</div>
            <div>
              <div style={{ color: '#EDE0D4', fontWeight: 600, fontSize: 15 }}>Talk to ARIA</div>
              <div style={{ color: 'rgba(201,135,79,0.5)', fontSize: 11, letterSpacing: 1 }}>AI EXAM COACH</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(237,224,212,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%', padding: '10px 14px', borderRadius: 14,
                background: m.role === 'user' ? 'linear-gradient(135deg, #C9874F, #A0522D)' : 'rgba(255,255,255,0.06)',
                color: '#EDE0D4', fontSize: 14, lineHeight: 1.55,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.06)' }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && !loading && (
          <div style={{ padding: '0 16px 10px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                style={{
                  background: 'rgba(201,135,79,0.1)',
                  border: '1px solid rgba(201,135,79,0.25)',
                  color: 'rgba(201,135,79,0.85)',
                  borderRadius: 999,
                  padding: '5px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, flexShrink: 0 }}
        >
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
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [ariaOpen, setAriaOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    loadProgress(user.id);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) loadProgress(user.id);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
      if (!data.exam_date) setShowOnboarding(true);
    } else {
      const defaults = getDefaultProgress(userId);
      await supabase.from('aria_progress').insert(defaults);
      setProgress(defaults);
      setShowOnboarding(true);
    }
    setProgressLoading(false);
  }

  async function handleOnboardingComplete(data: { exam_date: string; state: string; exam_type: string; comfort_level: number }) {
    if (!user) return;
    const startingReadiness = data.comfort_level * 15 + 15;
    const updated = { ...progress!, exam_date: data.exam_date, current_readiness: startingReadiness };
    await supabase.from('aria_progress').update({
      exam_date: data.exam_date,
      current_readiness: startingReadiness,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
    setProgress(updated);
    setShowOnboarding(false);
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
        userName={user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
        onStartQuiz={() => window.location.href = '/quiz'}
        onViewFullSchedule={() => window.location.href = '/study-plan'}
        onOpenARIA={() => setAriaOpen(true)}
      />
      {ariaOpen && <ARIAChat userId={user.id} accessToken={session?.access_token} onClose={() => setAriaOpen(false)} />}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </div>
  );
}
