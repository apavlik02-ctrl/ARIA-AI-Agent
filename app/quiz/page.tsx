'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizRenderer from '@/components/QuizRenderer';
import { generatePracticeQuestions } from '@/lib/aria-tools';

const ALL_DOMAINS = ['life_types', 'health_insurance', 'policy_provisions', 'riders', 'annuities', 'regulations', 'federal_tax', 'qualified_plans'];

export default function QuizPage() {
  const searchParams = useSearchParams();
  const [started, setStarted] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [count, setCount] = useState(10);

  useEffect(() => {
    const d = searchParams.get('domains');
    if (d) {
      const parsed = d.split(',').filter(x => ALL_DOMAINS.includes(x));
      if (parsed.length) setDomains(parsed);
    }
    if (searchParams.get('autostart') === '1') setStarted(true);
  }, [searchParams]);
  const [results, setResults] = useState<any>(null);

  const questions = started ? generatePracticeQuestions(domains.length ? domains : ALL_DOMAINS, count) : [];

  function toggleDomain(d: string) {
    setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function handleComplete(res: any) {
    setResults(res);
  }

  if (results) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
            {Math.round(results.overall_score ?? 0)}%
          </div>
          <h2 className="text-2xl font-semibold mb-2">Quiz Complete</h2>
          <p className="text-[#EDE0D4]/60 mb-8">You scored {Math.round(results.overall_score ?? 0)}% overall.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            {Object.entries(results.domain_scores ?? {}).map(([domain, score]: any) => (
              <div key={domain} className="flex items-center justify-between">
                <span className="text-sm text-[#EDE0D4]/70 capitalize">{domain.replace(/_/g, ' ')}</span>
                <span className={`text-sm font-medium ${score >= 70 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(score)}%</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setStarted(false); setResults(null); }} className="px-6 py-3 rounded-2xl border border-white/20 hover:bg-white/5 transition-all text-sm">
              Take another quiz
            </button>
            <a href="/dashboard" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white font-medium hover:opacity-90 transition-all text-sm">
              Back to dashboard
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (started) {
    return (
      <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <QuizRenderer questions={questions} onComplete={handleComplete} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
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
            {[5, 10, 20].map(n => (
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
