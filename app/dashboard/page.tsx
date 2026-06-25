'use client';

import React, { useState } from 'react';
import ARIADashboard from '@/components/ARIADashboard';

// Demo data — replace with real Supabase data in production
const DEMO_PROGRESS = {
  current_readiness: 62,
  weak_domains: ['federal_tax', 'qualified_plans'],
  study_streak: 4,
  last_quiz_score: 74,
  exam_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  quiz_history: [
    { date: new Date(Date.now() - 3 * 86400000).toISOString(), score: 68, domain_scores: { life_types: 70, health_insurance: 65 } },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), score: 72, domain_scores: { life_types: 75, health_insurance: 69 } },
    { date: new Date(Date.now() - 86400000).toISOString(), score: 74, domain_scores: { life_types: 78, health_insurance: 71 } },
  ],
};

export default function DashboardPage() {
  const [ariaOpen, setAriaOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#0F0A07', color: '#EDE0D4' }}>
      <ARIADashboard
        userProgress={DEMO_PROGRESS}
        onStartQuiz={() => alert('Quiz coming soon!')}
        onViewFullSchedule={() => alert('Schedule coming soon!')}
        onOpenARIA={() => setAriaOpen(true)}
      />
      {ariaOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#1a1008', padding: 32, borderRadius: 16, maxWidth: 480, width: '100%' }}>
            <p style={{ color: '#EDE0D4', marginBottom: 16 }}>ARIA chat coming soon...</p>
            <button onClick={() => setAriaOpen(false)} style={{ color: '#C9874F', cursor: 'pointer', background: 'none', border: 'none' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
