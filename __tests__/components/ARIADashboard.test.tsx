// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ARIADashboard from '@/components/ARIADashboard';

const TODAY = '2026-06-29';
const FUTURE_EXAM = '2026-09-01';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

const baseProgress = {
  current_readiness: 65,
  weak_domains: ['riders'],
  study_streak: 3,
};

const baseProps = {
  userProgress: baseProgress,
  onStartQuiz: vi.fn(),
  onViewFullSchedule: vi.fn(),
  onOpenARIA: vi.fn(),
};

const sampleSchedule = {
  exam_date: FUTURE_EXAM,
  days_until_exam: 64,
  starting_readiness: 50,
  target_readiness: 80,
  daily_minutes: 45,
  weak_domains_focus: ['riders'],
  schedule: [
    { day: 1, date: '2026-06-30', focus_domains: ['riders'], minutes: 45, event: 'Quiz', spaced_repetition: false },
  ],
};

// ── Header ────────────────────────────────────────────────────────────────────

describe('ARIADashboard — header', () => {
  it('shows "ARIA DASHBOARD" label', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.getByText('ARIA DASHBOARD')).toBeInTheDocument();
  });

  it('greets by name when userName is provided', () => {
    render(<ARIADashboard {...baseProps} userName="Alex" />);
    expect(screen.getByText('Welcome back, Alex')).toBeInTheDocument();
  });

  it('greets "there" when userName is omitted', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.getByText('Welcome back, there')).toBeInTheDocument();
  });

  it('shows days until exam when exam_date is provided', () => {
    render(
      <ARIADashboard
        {...baseProps}
        userProgress={{ ...baseProgress, exam_date: FUTURE_EXAM }}
      />
    );
    expect(screen.getByText(/days until your exam/)).toBeInTheDocument();
  });

  it('shows generic subtitle when no exam_date is set', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.getByText(/Your insurance exam prep progress/)).toBeInTheDocument();
  });

  it('shows 0 days when exam date has passed', () => {
    render(
      <ARIADashboard
        {...baseProps}
        userProgress={{ ...baseProgress, exam_date: '2026-01-01' }}
      />
    );
    expect(screen.getByText(/0 days until your exam/)).toBeInTheDocument();
  });
});

// ── Quick actions ─────────────────────────────────────────────────────────────

describe('ARIADashboard — quick actions', () => {
  it('shows all three quick action buttons', () => {
    render(<ARIADashboard {...baseProps} />);
    // ReadinessWidget also renders a "Start Diagnostic Quiz" button, so use getAllByText
    expect(screen.getAllByText(/Start Diagnostic Quiz/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/View Full Study Plan/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Talk to ARIA/)).toBeInTheDocument();
  });

  it('calls onStartQuiz when "Start Diagnostic Quiz" is clicked', () => {
    const onStartQuiz = vi.fn();
    render(<ARIADashboard {...baseProps} onStartQuiz={onStartQuiz} />);
    // There are two Start Diagnostic Quiz buttons (QuickActions + ReadinessWidget)
    fireEvent.click(screen.getAllByText(/Start Diagnostic Quiz/)[0]);
    expect(onStartQuiz).toHaveBeenCalled();
  });

  it('calls onViewFullSchedule when "View Full Study Plan" is clicked', () => {
    const onViewFullSchedule = vi.fn();
    render(<ARIADashboard {...baseProps} onViewFullSchedule={onViewFullSchedule} />);
    fireEvent.click(screen.getAllByText(/View Full Study Plan/)[0]);
    expect(onViewFullSchedule).toHaveBeenCalled();
  });

  it('calls onOpenARIA when "Talk to ARIA" is clicked', () => {
    const onOpenARIA = vi.fn();
    render(<ARIADashboard {...baseProps} onOpenARIA={onOpenARIA} />);
    fireEvent.click(screen.getByText(/Talk to ARIA/));
    expect(onOpenARIA).toHaveBeenCalledOnce();
  });
});

// ── Recent activity ───────────────────────────────────────────────────────────

describe('ARIADashboard — recent activity', () => {
  it('shows "RECENT ACTIVITY" heading', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.getByText('RECENT ACTIVITY')).toBeInTheDocument();
  });

  it('shows empty state when there is no quiz history', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.getByText(/No quizzes yet/)).toBeInTheDocument();
  });

  it('renders the most recent quiz score', () => {
    render(
      <ARIADashboard
        {...baseProps}
        userProgress={{
          ...baseProgress,
          quiz_history: [{ date: '2026-06-28', score: 82, domain_scores: { riders: 80 } }],
        }}
      />
    );
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('shows at most 3 recent quizzes', () => {
    const history = Array.from({ length: 5 }, (_, i) => ({
      date: `2026-06-${i + 20}`,
      score: 60 + i,
      domain_scores: { riders: 60 + i },
    }));
    render(
      <ARIADashboard
        {...baseProps}
        userProgress={{ ...baseProgress, quiz_history: history }}
      />
    );
    // Each quiz row shows "Quiz •" prefix — count those
    const quizRows = screen.getAllByText(/^Quiz •/);
    expect(quizRows.length).toBe(3);
  });

  it('shows the domain count for a quiz', () => {
    render(
      <ARIADashboard
        {...baseProps}
        userProgress={{
          ...baseProgress,
          quiz_history: [{
            date: '2026-06-28',
            score: 75,
            domain_scores: { riders: 70, annuities: 80, life_types: 75 },
          }],
        }}
      />
    );
    expect(screen.getByText('3 domains tested')).toBeInTheDocument();
  });
});

// ── Study schedule sidebar ────────────────────────────────────────────────────

describe('ARIADashboard — study schedule', () => {
  it('shows "NEXT 7 DAYS" when studySchedule is provided', () => {
    render(<ARIADashboard {...baseProps} studySchedule={sampleSchedule} />);
    expect(screen.getByText('NEXT 7 DAYS')).toBeInTheDocument();
  });

  it('does not show "NEXT 7 DAYS" when studySchedule is omitted', () => {
    render(<ARIADashboard {...baseProps} />);
    expect(screen.queryByText('NEXT 7 DAYS')).not.toBeInTheDocument();
  });

  it('renders the schedule content when provided', () => {
    render(<ARIADashboard {...baseProps} studySchedule={sampleSchedule} />);
    expect(screen.getByText('Personalized Study Schedule')).toBeInTheDocument();
  });
});
