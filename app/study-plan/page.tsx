'use client';

import React, { useState, useEffect } from 'react';
import { createStudySchedule } from '@/lib/aria-tools';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { UserProgress } from '@/lib/progress';

const TODAY = new Date().toISOString().split('T')[0];

export default function StudyPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'simulation' | 'upcoming'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { window.location.href = '/login'; return; }

    supabase
      .from('aria_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProgress(data as UserProgress);
        setProgressLoading(false);
      });
  }, [user, authLoading]);

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
        <div className="text-[#EDE0D4]/40 text-sm">Loading your study plan…</div>
      </div>
    );
  }

  if (!progress) return null;

  const examDate = progress.exam_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const scheduleData = createStudySchedule(
    examDate,
    progress.current_readiness,
    progress.weak_domains,
    45
  );

  const { days_until_exam, starting_readiness, target_readiness, daily_minutes, weak_domains_focus, schedule } = scheduleData;

  const filtered = schedule.filter((item: any) => {
    if (filter === 'simulation') return item.event.includes('Simulation');
    if (filter === 'upcoming') return item.date >= TODAY;
    return true;
  });

  const visible = showAll ? filtered : filtered.slice(0, 14);

  function quizUrl(domains: string[], simulation = false) {
    return `/quiz?domains=${domains.join(',')}&count=${simulation ? 40 : 10}`;
  }

  const isPast = (date: string) => date < TODAY;
  const isToday = (date: string) => date === TODAY;

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold">A</div>
            <div className="text-xl font-semibold tracking-[3px]">ARIA</div>
          </a>
          <div className="flex items-center gap-1">
            <a href="/settings" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-[#EDE0D4]/60 hover:text-[#EDE0D4] transition-colors px-2">⚙ Settings</a>
            <a href="/dashboard" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-[#EDE0D4]/60 hover:text-[#EDE0D4] transition-colors px-2">← Dashboard</a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-semibold mb-1">Your Study Plan</h1>
        <p className="text-[#EDE0D4]/60 mb-6">
          Personalized schedule based on your readiness and exam date.{' '}
          {!progress.exam_date && (
            <a href="/settings" className="text-[#C9874F] hover:opacity-80">Set your exam date →</a>
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Days Left', value: days_until_exam },
            { label: 'Current Readiness', value: `${starting_readiness}%` },
            { label: 'Target', value: `${target_readiness}%` },
            { label: 'Daily Minutes', value: daily_minutes },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-[#C9874F]">{s.value}</div>
              <div className="text-xs text-[#EDE0D4]/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {weak_domains_focus?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-[#EDE0D4]/50 uppercase tracking-wider mb-2">Focus Areas</p>
            <div className="flex flex-wrap gap-2">
              {weak_domains_focus.map((d: string) => (
                <span key={d} className="px-3 py-1 rounded-full text-xs bg-[#C9874F]/10 border border-[#C9874F]/30 text-[#C9874F]">
                  {d.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-5">
          {(['all', 'upcoming', 'simulation'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all capitalize ${
                filter === f ? 'bg-[#C9874F]/20 border-[#C9874F] text-[#C9874F]' : 'border-white/15 hover:border-white/30'
              }`}
            >
              {f === 'simulation' ? '🎯 Simulations' : f === 'upcoming' ? '📅 Upcoming' : 'All Days'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {visible.map((item: any, i: number) => {
            const past = isPast(item.date);
            const today = isToday(item.date);
            const isSimulation = item.event.includes('Simulation');

            return (
              <div
                key={i}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl px-5 py-4 border transition-all ${
                  today
                    ? 'bg-[#C9874F]/10 border-[#C9874F]/50'
                    : isSimulation
                    ? 'bg-[#C9874F]/5 border-[#C9874F]/25'
                    : 'bg-white/[0.02] border-white/[0.08]'
                } ${past ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    today ? 'bg-[#C9874F] text-white' : isSimulation ? 'bg-[#C9874F]/20 text-[#C9874F]' : 'bg-white/5 text-[#EDE0D4]/60'
                  }`}>
                    {past ? '✓' : isSimulation ? 'SIM' : item.day}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.date}</span>
                      {today && <span className="text-xs bg-[#C9874F] text-white px-2 py-0.5 rounded-full">Today</span>}
                      {isSimulation && <span className="text-xs bg-[#C9874F]/20 text-[#C9874F] px-2 py-0.5 rounded-full">Simulation</span>}
                      {item.spaced_repetition && <span className="text-xs text-[#EDE0D4]/30">↺ Spaced rep</span>}
                    </div>
                    <div className="text-xs text-[#EDE0D4]/50 mt-0.5">
                      {item.focus_domains.map((d: string) => d.replace(/_/g, ' ')).join(' · ')} · {item.minutes} min
                    </div>
                  </div>
                </div>

                {!past && (
                  <a
                    href={quizUrl(item.focus_domains, isSimulation)}
                    className={`text-xs px-4 py-2 rounded-xl font-medium shrink-0 transition-all text-center sm:text-left ${
                      isSimulation || today
                        ? 'bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white hover:opacity-90'
                        : 'border border-white/15 hover:border-[#C9874F]/50 hover:text-[#C9874F]'
                    }`}
                  >
                    {isSimulation ? '⚡ Start Simulation' : 'Start Session →'}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length > 14 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-3 rounded-2xl border border-white/10 text-sm text-[#EDE0D4]/60 hover:border-[#C9874F]/40 hover:text-[#C9874F] transition-all"
          >
            {showAll ? 'Show less ↑' : `Show all ${filtered.length} days ↓`}
          </button>
        )}

        <p className="text-center text-xs text-[#EDE0D4]/30 mt-8">
          Exam date: {examDate}
        </p>
      </main>
    </div>
  );
}
