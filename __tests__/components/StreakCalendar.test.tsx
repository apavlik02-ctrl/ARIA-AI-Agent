// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StreakCalendar from '@/components/StreakCalendar';

const TODAY = '2026-06-29';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Header / stat display ─────────────────────────────────────────────────────

describe('StreakCalendar — header', () => {
  it('shows "STUDY STREAK" heading', () => {
    render(<StreakCalendar quizHistory={[]} studyStreak={0} />);
    expect(screen.getByText('STUDY STREAK')).toBeInTheDocument();
  });

  it('shows the streak count in the header', () => {
    render(<StreakCalendar quizHistory={[]} studyStreak={7} />);
    expect(screen.getByText(/7 day streak/)).toBeInTheDocument();
  });

  it('shows "0 day streak" when streak is zero', () => {
    render(<StreakCalendar quizHistory={[]} studyStreak={0} />);
    expect(screen.getByText(/0 day streak/)).toBeInTheDocument();
  });

  it('shows total days studied', () => {
    const quizHistory = [
      { date: '2026-06-27' },
      { date: '2026-06-28' },
      { date: '2026-06-29' },
    ];
    render(<StreakCalendar quizHistory={quizHistory} studyStreak={3} />);
    expect(screen.getByText('3 days studied')).toBeInTheDocument();
  });

  it('shows 0 days studied for an empty history', () => {
    render(<StreakCalendar quizHistory={[]} studyStreak={0} />);
    expect(screen.getByText('0 days studied')).toBeInTheDocument();
  });
});

// ── Calendar grid ─────────────────────────────────────────────────────────────

describe('StreakCalendar — calendar grid', () => {
  it('renders exactly 105 day cells (15 weeks × 7 days)', () => {
    const { container } = render(
      <StreakCalendar quizHistory={[]} studyStreak={0} />
    );
    // Each day is a div with a title attribute formatted as "YYYY-MM-DD..."
    const cells = container.querySelectorAll('[title]');
    expect(cells.length).toBe(105);
  });

  it('marks today\'s cell with a special border', () => {
    const { container } = render(
      <StreakCalendar quizHistory={[]} studyStreak={0} />
    );
    const todayCell = container.querySelector(`[title^="${TODAY}"]`);
    expect(todayCell).not.toBeNull();
    expect((todayCell as HTMLElement).style.border).toContain('1px solid');
  });

  it('marks a studied day with "studied" in the title', () => {
    const { container } = render(
      <StreakCalendar
        quizHistory={[{ date: '2026-06-28' }]}
        studyStreak={1}
      />
    );
    const studiedCell = container.querySelector('[title="2026-06-28 — studied"]');
    expect(studiedCell).not.toBeNull();
  });

  it('does not add "— studied" to the title for days without study activity', () => {
    const { container } = render(
      <StreakCalendar quizHistory={[]} studyStreak={0} />
    );
    const unstudiedCell = container.querySelector('[title="2026-06-28"]');
    expect(unstudiedCell).not.toBeNull();
    expect(unstudiedCell?.getAttribute('title')).not.toContain('studied');
  });

  it('deduplicates multiple quiz history entries on the same day', () => {
    const quizHistory = [
      { date: '2026-06-28T10:00:00Z' },
      { date: '2026-06-28T14:00:00Z' },
    ];
    render(<StreakCalendar quizHistory={quizHistory} studyStreak={1} />);
    // Despite two entries on the same day, should only count as 1 day studied
    expect(screen.getByText('1 days studied')).toBeInTheDocument();
  });
});

// ── Legend ────────────────────────────────────────────────────────────────────

describe('StreakCalendar — legend', () => {
  it('shows "Less" and "More" legend labels', () => {
    render(<StreakCalendar quizHistory={[]} studyStreak={0} />);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
