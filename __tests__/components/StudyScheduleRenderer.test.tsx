// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudyScheduleRenderer from '@/components/StudyScheduleRenderer';

function makeItem(overrides: Partial<{
  day: number; date: string; focus_domains: string[];
  minutes: number; event: string; spaced_repetition: boolean;
}> = {}) {
  return {
    day: 1,
    date: '2026-07-01',
    focus_domains: ['life_insurance'],
    minutes: 45,
    event: 'Quiz Practice',
    spaced_repetition: false,
    ...overrides,
  };
}

const baseData = {
  exam_date: '2026-09-01',
  days_until_exam: 64,
  starting_readiness: 50,
  target_readiness: 80,
  daily_minutes: 45,
  weak_domains_focus: ['life_insurance'],
  schedule: [makeItem()],
};

// ── Null / empty guard ────────────────────────────────────────────────────────

describe('StudyScheduleRenderer — null guard', () => {
  it('shows fallback when scheduleData is null-ish', () => {
    // @ts-expect-error intentional bad prop for test
    render(<StudyScheduleRenderer scheduleData={null} />);
    expect(screen.getByText('No schedule available.')).toBeInTheDocument();
  });

  it('shows fallback when schedule array is missing', () => {
    const data = { ...baseData, schedule: undefined } as any;
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText('No schedule available.')).toBeInTheDocument();
  });
});

// ── Header ────────────────────────────────────────────────────────────────────

describe('StudyScheduleRenderer — header', () => {
  it('shows "Personalized Study Schedule" heading', () => {
    render(<StudyScheduleRenderer scheduleData={baseData} />);
    expect(screen.getByText('Personalized Study Schedule')).toBeInTheDocument();
  });

  it('shows days until exam in the subtitle', () => {
    render(<StudyScheduleRenderer scheduleData={baseData} />);
    expect(screen.getByText(/64 days until exam/)).toBeInTheDocument();
  });

  it('shows target readiness in the subtitle', () => {
    render(<StudyScheduleRenderer scheduleData={baseData} />);
    expect(screen.getByText(/Target: 80% readiness/)).toBeInTheDocument();
  });
});

// ── Schedule items ────────────────────────────────────────────────────────────

describe('StudyScheduleRenderer — schedule items', () => {
  it('renders a schedule item with day number', () => {
    const data = { ...baseData, schedule: [makeItem({ day: 3, date: '2026-07-03' })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText(/Day 3/)).toBeInTheDocument();
  });

  it('renders the item date', () => {
    const data = { ...baseData, schedule: [makeItem({ date: '2026-07-15' })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText(/2026-07-15/)).toBeInTheDocument();
  });

  it('renders focus domains for an item', () => {
    const data = {
      ...baseData,
      schedule: [makeItem({ focus_domains: ['annuities', 'riders'] })],
    };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText(/annuities, riders/)).toBeInTheDocument();
  });

  it('renders study minutes for an item', () => {
    const data = { ...baseData, schedule: [makeItem({ minutes: 60 })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText(/60 min/)).toBeInTheDocument();
  });

  it('renders the event type', () => {
    const data = { ...baseData, schedule: [makeItem({ event: 'Quiz Practice' })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText('Quiz Practice')).toBeInTheDocument();
  });

  it('shows "Spaced Repetition" badge when spaced_repetition is true', () => {
    const data = { ...baseData, schedule: [makeItem({ spaced_repetition: true })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText('Spaced Repetition')).toBeInTheDocument();
  });

  it('does not show "Spaced Repetition" badge when false', () => {
    const data = { ...baseData, schedule: [makeItem({ spaced_repetition: false })] };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.queryByText('Spaced Repetition')).not.toBeInTheDocument();
  });
});

// ── Simulation items ──────────────────────────────────────────────────────────

describe('StudyScheduleRenderer — Simulation events', () => {
  it('renders a Simulation event label', () => {
    const data = {
      ...baseData,
      schedule: [makeItem({ event: 'Full Simulation Exam' })],
    };
    render(<StudyScheduleRenderer scheduleData={data} />);
    expect(screen.getByText('Full Simulation Exam')).toBeInTheDocument();
  });
});

// ── 14-item cap and overflow message ─────────────────────────────────────────

describe('StudyScheduleRenderer — item cap', () => {
  it('renders at most 14 schedule items', () => {
    const schedule = Array.from({ length: 20 }, (_, i) =>
      makeItem({ day: i + 1, date: `2026-07-${String(i + 1).padStart(2, '0')}` })
    );
    render(<StudyScheduleRenderer scheduleData={{ ...baseData, schedule }} />);
    // Each item shows "Day N", count how many appear
    const dayMatches = screen.getAllByText(/^Day \d+/);
    expect(dayMatches.length).toBe(14);
  });

  it('shows overflow message when schedule has more than 14 items', () => {
    const schedule = Array.from({ length: 20 }, (_, i) =>
      makeItem({ day: i + 1, date: `2026-07-${String(i + 1).padStart(2, '0')}` })
    );
    render(<StudyScheduleRenderer scheduleData={{ ...baseData, schedule }} />);
    expect(screen.getByText(/\+ 6 more days in full schedule/)).toBeInTheDocument();
  });

  it('does not show overflow message when schedule has 14 or fewer items', () => {
    const schedule = Array.from({ length: 14 }, (_, i) =>
      makeItem({ day: i + 1, date: `2026-07-${String(i + 1).padStart(2, '0')}` })
    );
    render(<StudyScheduleRenderer scheduleData={{ ...baseData, schedule }} />);
    expect(screen.queryByText(/more days in full schedule/)).not.toBeInTheDocument();
  });
});
