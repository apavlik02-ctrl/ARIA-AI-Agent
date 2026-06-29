// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadinessChart from '@/components/ReadinessChart';

const twoQuizzes = [
  { date: '2026-06-01', score: 60 },
  { date: '2026-06-15', score: 75 },
];

// ── Empty / minimal state ─────────────────────────────────────────────────────

describe('ReadinessChart — empty state', () => {
  it('shows placeholder when quizHistory has fewer than 2 entries', () => {
    render(<ReadinessChart quizHistory={[]} currentReadiness={50} />);
    expect(screen.getByText(/Take 2\+ quizzes to see your progress chart/)).toBeInTheDocument();
  });

  it('shows placeholder with exactly 1 quiz entry', () => {
    render(<ReadinessChart quizHistory={[{ date: '2026-06-01', score: 65 }]} currentReadiness={65} />);
    expect(screen.getByText(/Take 2\+ quizzes to see your progress chart/)).toBeInTheDocument();
  });

  it('does not render the SVG chart for fewer than 2 entries', () => {
    const { container } = render(<ReadinessChart quizHistory={[]} currentReadiness={50} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

// ── Header / trend display ────────────────────────────────────────────────────

describe('ReadinessChart — header', () => {
  it('shows "READINESS TREND" heading with 2+ quiz entries', () => {
    render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    expect(screen.getByText('READINESS TREND')).toBeInTheDocument();
  });

  it('shows a positive trend delta when scores improved', () => {
    const history = [{ date: '2026-06-01', score: 60 }, { date: '2026-06-15', score: 75 }];
    render(<ReadinessChart quizHistory={history} currentReadiness={75} />);
    expect(screen.getByText(/\+15% overall/)).toBeInTheDocument();
  });

  it('shows a negative trend delta when scores declined', () => {
    const history = [{ date: '2026-06-01', score: 80 }, { date: '2026-06-15', score: 65 }];
    render(<ReadinessChart quizHistory={history} currentReadiness={65} />);
    expect(screen.getByText(/-15% overall/)).toBeInTheDocument();
  });

  it('shows a zero delta when scores are unchanged', () => {
    const history = [{ date: '2026-06-01', score: 70 }, { date: '2026-06-15', score: 70 }];
    render(<ReadinessChart quizHistory={history} currentReadiness={70} />);
    expect(screen.getByText(/0% overall/)).toBeInTheDocument();
  });

  it('shows the correct quiz count', () => {
    const history = [
      { date: '2026-06-01', score: 60 },
      { date: '2026-06-10', score: 65 },
      { date: '2026-06-15', score: 70 },
    ];
    render(<ReadinessChart quizHistory={history} currentReadiness={70} />);
    expect(screen.getByText('3 quizzes')).toBeInTheDocument();
  });

  it('shows "2 quizzes" with exactly two entries', () => {
    render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    expect(screen.getByText('2 quizzes')).toBeInTheDocument();
  });
});

// ── Current readiness footer ──────────────────────────────────────────────────

describe('ReadinessChart — current readiness', () => {
  it('shows "Current readiness" label', () => {
    render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    expect(screen.getByText('Current readiness')).toBeInTheDocument();
  });

  it('shows the currentReadiness value as a percentage', () => {
    render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={72} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('shows green color for currentReadiness >= 70', () => {
    const { container } = render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={70} />);
    // The footer percentage is in a <span>; the SVG label is in a <text> element
    const spans = Array.from(container.querySelectorAll('span')).filter(
      el => el.textContent === '70%'
    );
    expect(spans.length).toBeGreaterThanOrEqual(1);
    const style = spans[0].getAttribute('style') ?? '';
    expect(style).toMatch(/rgb\(74,\s*222,\s*128\)|#4ade80/i);
  });

  it('shows amber/orange color for currentReadiness < 70', () => {
    const { container } = render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={65} />);
    const spans = Array.from(container.querySelectorAll('span')).filter(
      el => el.textContent === '65%'
    );
    expect(spans.length).toBeGreaterThanOrEqual(1);
    const style = spans[0].getAttribute('style') ?? '';
    expect(style).toMatch(/rgb\(201,\s*135,\s*79\)|#[cC]9874[fF]/);
  });
});

// ── SVG chart ─────────────────────────────────────────────────────────────────

describe('ReadinessChart — SVG', () => {
  it('renders an SVG element with 2+ quiz entries', () => {
    const { container } = render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders one circle per quiz entry', () => {
    const { container } = render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(twoQuizzes.length);
  });

  it('renders a path element for the trend line', () => {
    const { container } = render(<ReadinessChart quizHistory={twoQuizzes} currentReadiness={75} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });
});
