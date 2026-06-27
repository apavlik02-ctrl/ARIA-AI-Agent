'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizRenderer from '@/components/QuizRenderer';
import { generatePracticeQuestions } from '@/lib/aria-tools';
import { useAuth } from '@/hooks/useAuth';

const ALL_DOMAINS = ['life_types', 'health_insurance', 'policy_provisions', 'riders', 'annuities', 'regulations', 'federal_tax', 'qualified_plans'];

function QuizContent() {
  const searchParams = useSearchParams();
  const { user, session } = useAuth();
  const [started, setStarted] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const d = searchParams.get('domains');
    if (d) {
      const parsed = d.split(',').filter(x => ALL_DOMAINS.includes(x));
      if (parsed.length) setDomains(parsed);
    }
    const c = parseInt(searchParams.get('count') ?? '', 10);
    if (c > 0) setCount(c);
    if (searchParams.get('autostart') === '1') setStarted(true);
  }, [searchParams]);

  const questions = started ? generatePracticeQuestions(domains.length ? domains : ALL_DOMAINS, count) : [];

  function toggleDomain(d: string) {
    setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  if (results) {
    const score = Math.round(results.overall_score ?? 0);
    const passed = score >= 70;
    const weakDomains = Object.entries(results.domain_scores ?? {})
      .filter(([, s]: any) => s < 70)
      .sort(([, a]: any, [, b]: any) => a - b);
    const strongDomains = Object.entries(results.domain_scores ?? {})
      .filter(([, s]: any) => s >= 70)
      .sort(([, a]: any, [, b]: any) => b - a);

    return (
      <>
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
          <div className="text-center mb-10">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${passed ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-[#C9874F] to-[#7B3910]'}`}>
              {score}%
            </div>
            <h2 className="text-2xl font-semibold mb-1">{passed ? 'Great work!' : 'Keep going!'}</h2>
            <p className="text-[#EDE0D4]/60">
              {results.correct_count} of {results.total_questions} correct
              {passed ? ' — you\'re on track.' : ' — review your weak areas below.'}
            </p>
          </div>

          {weakDomains.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-5">
              <div className="text-sm font-semibold text-red-400 mb-3">Focus on these next</div>
              <div className="space-y-2.5">
                {weakDomains.map(([domain, s]: any) => (
                  <div key={domain} className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${Math.round(s)}%` }} />
                    </div>
                    <span className="text-xs text-[#EDE0D4]/60 w-8 text-right">{Math.round(s)}%</span>
                    <span className="text-sm text-[#EDE0D4]/80 capitalize w-40">{domain.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strongDomains.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-8">
              <div className="text-sm font-semibold text-green-400 mb-3">Strong areas</div>
              <div className="space-y-2.5">
                {strongDomains.map(([domain, s]: any) => (
                  <div key={domain} className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${Math.round(s)}%` }} />
                    </div>
                    <span className="text-xs text-[#EDE0D4]/60 w-8 text-right">{Math.round(s)}%</span>
                    <span className="text-sm text-[#EDE0D4]/80 capitalize w-40">{domain.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {weakDomains.length > 0 && (
              <a
                href={`/quiz?domains=${weakDomains.map(([d]) => d).join(',')}&count=10&autostart=1`}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all text-sm text-center"
              >
                Practice weak areas →
              </a>
            )}
            <button
              onClick={() => { setStarted(false); setResults(null); }}
              className="flex-1 py-3 rounded-2xl border border-white/20 hover:bg-white/5 transition-all text-sm"
            >
              New quiz
            </button>
            <a href="/dashboard" className="flex-1 py-3 rounded-2xl border border-white/20 hover:bg-white/5 transition-all text-sm text-center">
              Dashboard
            </a>
          </div>
        </main>
      </>
    );
  }

  if (started) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <QuizRenderer questions={questions} onComplete={async (res: any) => {
            setResults(res);
            if (user) {
              await fetch('/api/aria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'submit_quiz_result',
                  userId: user.id,
                  accessToken: session?.access_token,
                  payload: { quizResult: res },
                }),
              });
            }
          }} />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-semibold mb-2">Diagnostic Quiz</h1>
        <p className="text-[#EDE0D4]/60 mb-10">Choose your focus areas and number of questions.</p>

        <div className="mb-8">
          <p className="text-sm text-[#EDE0D4]/70 mb-3">Focus areas <span className="text-[#EDE0D4]/40">(leave blank for all)</span></p>
          <div className="flex flex-wrap gap-2">
            {ALL_DOMAINS.map(d => (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                  domains.includes(d)
                    ? 'bg-[#C9874F]/20 border-[#C9874F] text-[#C9874F]'
                    : 'border-white/15 hover:border-white/30'
                }`}
              >
                {d.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <p className="text-sm text-[#EDE0D4]/70 mb-3">Number of questions</p>
          <div className="flex gap-3">
            {[5, 10, 20, 40].map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-6 py-2 rounded-xl text-sm border transition-all ${
                  count === n ? 'bg-[#C9874F]/20 border-[#C9874F] text-[#C9874F]' : 'border-white/15 hover:border-white/30'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all"
        >
          ⚡ Start Quiz
        </button>
      </main>
    </>
  );
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#EDE0D4]/40">Loading…</div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold">A</div>
          <div className="text-xl font-semibold tracking-[3px]">ARIA</div>
        </a>
        <a href="/dashboard" className="text-sm text-[#EDE0D4]/60 hover:text-[#EDE0D4] transition-colors">← Dashboard</a>
      </div>
    </header>
  );
}
