// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadinessWidget from '@/components/ReadinessWidget';

const baseProgress = {
  current_readiness: 72,
  weak_domains: ['riders', 'health_insurance'],
  study_streak: 5,
};

// ── Readiness score display ───────────────────────────────────────────────────

describe('ReadinessWidget — readiness display', () => {
  it('shows the current readiness percentage', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('shows "Overall Readiness" label', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.getByText('Overall Readiness')).toBeInTheDocument();
  });

  it('renders a green progress bar for scores ≥ 80', () => {
    const { container } = render(
      <ReadinessWidget progress={{ ...baseProgress, current_readiness: 85 }} />
    );
    const bar = container.querySelector('[style*="background: rgb(74, 222, 128)"], [style*="background: #4ade80"]');
    expect(bar).not.toBeNull();
  });

  it('renders a yellow progress bar for scores between 65 and 79', () => {
    const { container } = render(
      <ReadinessWidget progress={{ ...baseProgress, current_readiness: 70 }} />
    );
    const bar = container.querySelector('[style*="background: rgb(251, 191, 36)"], [style*="background: #fbbf24"]');
    expect(bar).not.toBeNull();
  });

  it('renders a red progress bar for scores below 65', () => {
    const { container } = render(
      <ReadinessWidget progress={{ ...baseProgress, current_readiness: 50 }} />
    );
    const bar = container.querySelector('[style*="background: rgb(248, 113, 113)"], [style*="background: #f87171"]');
    expect(bar).not.toBeNull();
  });
});

// ── Streak ────────────────────────────────────────────────────────────────────

describe('ReadinessWidget — streak', () => {
  it('shows the study streak', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.getByText(/5 day streak/)).toBeInTheDocument();
  });

  it('shows a zero streak', () => {
    render(<ReadinessWidget progress={{ ...baseProgress, study_streak: 0 }} />);
    expect(screen.getByText(/0 day streak/)).toBeInTheDocument();
  });
});

// ── Last quiz score ───────────────────────────────────────────────────────────

describe('ReadinessWidget — last quiz score', () => {
  it('shows the last quiz score when provided', () => {
    render(<ReadinessWidget progress={{ ...baseProgress, last_quiz_score: 78 }} />);
    expect(screen.getByText(/Last quiz: 78%/)).toBeInTheDocument();
  });

  it('does not show last quiz score when omitted', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.queryByText(/Last quiz/)).not.toBeInTheDocument();
  });
});

// ── Weak domains ──────────────────────────────────────────────────────────────

describe('ReadinessWidget — weak domains', () => {
  it('shows "FOCUS AREAS" heading when weak domains exist', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.getByText('FOCUS AREAS')).toBeInTheDocument();
  });

  it('renders each weak domain as a link', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.getByText(/riders →/)).toBeInTheDocument();
    expect(screen.getByText(/health insurance →/)).toBeInTheDocument();
  });

  it('replaces underscores with spaces in domain names', () => {
    render(
      <ReadinessWidget
        progress={{ ...baseProgress, weak_domains: ['policy_provisions'] }}
      />
    );
    expect(screen.getByText(/policy provisions/)).toBeInTheDocument();
  });

  it('domain links point to the quiz page with the correct domain param', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    const link = screen.getByText(/riders →/).closest('a');
    expect(link?.getAttribute('href')).toContain('riders');
  });

  it('does not show "FOCUS AREAS" when weak_domains is empty', () => {
    render(<ReadinessWidget progress={{ ...baseProgress, weak_domains: [] }} />);
    expect(screen.queryByText('FOCUS AREAS')).not.toBeInTheDocument();
  });
});

// ── Exam date ─────────────────────────────────────────────────────────────────

describe('ReadinessWidget — exam date', () => {
  it('shows a formatted exam date when provided', () => {
    render(<ReadinessWidget progress={{ ...baseProgress, exam_date: '2026-12-31' }} />);
    expect(screen.getByText(/Exam date:/)).toBeInTheDocument();
  });

  it('does not show exam date when omitted', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.queryByText(/Exam date:/)).not.toBeInTheDocument();
  });
});

// ── Action buttons ────────────────────────────────────────────────────────────

describe('ReadinessWidget — action buttons', () => {
  it('shows "Start Diagnostic Quiz" when onStartQuiz is provided', () => {
    render(<ReadinessWidget progress={baseProgress} onStartQuiz={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Start Diagnostic Quiz/i })).toBeInTheDocument();
  });

  it('does not show "Start Diagnostic Quiz" when onStartQuiz is omitted', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.queryByRole('button', { name: /Start Diagnostic Quiz/i })).not.toBeInTheDocument();
  });

  it('calls onStartQuiz when the button is clicked', () => {
    const onStartQuiz = vi.fn();
    render(<ReadinessWidget progress={baseProgress} onStartQuiz={onStartQuiz} />);
    fireEvent.click(screen.getByRole('button', { name: /Start Diagnostic Quiz/i }));
    expect(onStartQuiz).toHaveBeenCalledOnce();
  });

  it('shows "View Study Plan" when onViewSchedule is provided', () => {
    render(<ReadinessWidget progress={baseProgress} onViewSchedule={vi.fn()} />);
    expect(screen.getByRole('button', { name: /View Study Plan/i })).toBeInTheDocument();
  });

  it('does not show "View Study Plan" when onViewSchedule is omitted', () => {
    render(<ReadinessWidget progress={baseProgress} />);
    expect(screen.queryByRole('button', { name: /View Study Plan/i })).not.toBeInTheDocument();
  });

  it('calls onViewSchedule when the button is clicked', () => {
    const onViewSchedule = vi.fn();
    render(<ReadinessWidget progress={baseProgress} onViewSchedule={onViewSchedule} />);
    fireEvent.click(screen.getByRole('button', { name: /View Study Plan/i }));
    expect(onViewSchedule).toHaveBeenCalledOnce();
  });

  it('can render both action buttons simultaneously', () => {
    render(
      <ReadinessWidget
        progress={baseProgress}
        onStartQuiz={vi.fn()}
        onViewSchedule={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Start Diagnostic Quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Study Plan/i })).toBeInTheDocument();
  });
});
