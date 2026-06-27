'use client';

import React from 'react';
import StudyScheduleRenderer from '@/components/StudyScheduleRenderer';
import { createStudySchedule } from '@/lib/aria-tools';

const DEMO_PROGRESS = {
  exam_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  current_readiness: 62,
  weak_domains: ['federal_tax', 'qualified_plans'],
};

export default function StudyPlanPage() {
  const schedule = createStudySchedule(
    DEMO_PROGRESS.exam_date,
    DEMO_PROGRESS.current_readiness,
    DEMO_PROGRESS.weak_domains,
    45
  );

  return (
    <div className="min-h-screen bg-[#0F0A07] text-[#EDE0D4] flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-[1100px] mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9874F] to-[#7B3910] flex items-center justify-center text-white font-bold">A</div>
            <div className="text-xl font-semibold tracking-[3px]">ARIA</div>
          </a>
          <a href="/dashboard" className="text-sm text-[#EDE0D4]/60 hover:text-[#EDE0D4] transition-colors">← Dashboard</a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-semibold mb-2">Your Study Plan</h1>
        <p className="text-[#EDE0D4]/60 mb-8">Personalized schedule based on your readiness and exam date.</p>
        <StudyScheduleRenderer scheduleData={schedule} />
      </main>
    </div>
  );
}
