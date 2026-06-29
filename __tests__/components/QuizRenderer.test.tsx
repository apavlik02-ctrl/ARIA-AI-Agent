// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizRenderer from '@/components/QuizRenderer';

const makeQuestion = (id: number, correct: string, domain = 'life_types') => ({
  id,
  question: `Question ${id} text`,
  options: ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'],
  correct,
  explanation: `Explanation for question ${id}`,
  know_this: `Know this for question ${id}`,
  domain,
});

const SINGLE_Q = [makeQuestion(1, 'B', 'life_types')];

const TWO_Q = [makeQuestion(1, 'B', 'life_types'), makeQuestion(2, 'A', 'riders')];

const THREE_Q = [
  makeQuestion(1, 'B', 'life_types'),
  makeQuestion(2, 'A', 'riders'),
  makeQuestion(3, 'C', 'health_insurance'),
];

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('QuizRenderer — rendering', () => {
  it('shows the first question text', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    expect(screen.getByText('Question 1 text')).toBeInTheDocument();
  });

  it('shows all four answer options', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    expect(screen.getByText(/Option A/)).toBeInTheDocument();
    expect(screen.getByText(/Option B/)).toBeInTheDocument();
    expect(screen.getByText(/Option C/)).toBeInTheDocument();
    expect(screen.getByText(/Option D/)).toBeInTheDocument();
  });

  it('shows "Question 1 of N" progress indicator', () => {
    render(<QuizRenderer questions={TWO_Q} />);
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('"Check Answer" button is disabled before any selection', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    expect(screen.getByRole('button', { name: /Check Answer/i })).toBeDisabled();
  });
});

// ── Answer selection ──────────────────────────────────────────────────────────

describe('QuizRenderer — answer selection', () => {
  it('enables "Check Answer" once an option is selected', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option A/));
    expect(screen.getByRole('button', { name: /Check Answer/i })).not.toBeDisabled();
  });

  it('does not show explanation before "Check Answer" is clicked', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    expect(screen.queryByText(/Explanation for question 1/)).not.toBeInTheDocument();
  });

  it('prevents changing the selection after revealing the answer', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option A/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    // All option buttons should now be disabled
    const optionButtons = screen
      .getAllByRole('button')
      .filter(b => /Option/.test(b.textContent ?? ''));
    optionButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});

// ── Answer reveal ─────────────────────────────────────────────────────────────

describe('QuizRenderer — answer reveal', () => {
  it('shows the explanation after clicking "Check Answer"', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByText(/Explanation for question 1/)).toBeInTheDocument();
  });

  it('shows "Correct!" when the right option was selected', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option B/)); // correct = 'B'
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByText(/✓ Correct!/)).toBeInTheDocument();
  });

  it('shows "Incorrect" when the wrong option was selected', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option A/)); // correct = 'B', selected 'A'
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByText(/✗ Incorrect/)).toBeInTheDocument();
  });

  it('shows the KNOW THIS panel after revealing', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByText('KNOW THIS')).toBeInTheDocument();
    expect(screen.getByText(/Know this for question 1/)).toBeInTheDocument();
  });

  it('switches "Check Answer" to "Next Question" after reveal (non-last question)', () => {
    render(<QuizRenderer questions={TWO_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByRole('button', { name: /Next Question/i })).toBeInTheDocument();
  });

  it('shows "See Results" instead of "Next Question" on the last question', () => {
    render(<QuizRenderer questions={SINGLE_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    expect(screen.getByRole('button', { name: /See Results/i })).toBeInTheDocument();
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('QuizRenderer — navigation', () => {
  it('advances to the second question after clicking "Next Question"', () => {
    render(<QuizRenderer questions={TWO_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    expect(screen.getByText('Question 2 text')).toBeInTheDocument();
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
  });

  it('hides the explanation panel after moving to the next question', () => {
    render(<QuizRenderer questions={TWO_Q} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    expect(screen.queryByText(/Explanation for question 1/)).not.toBeInTheDocument();
  });
});

// ── Score calculation (via onComplete) ───────────────────────────────────────

describe('QuizRenderer — score calculation', () => {
  function completeQuiz(questions: ReturnType<typeof makeQuestion>[], correctSelections: string[]) {
    const onComplete = vi.fn();
    render(<QuizRenderer questions={questions} onComplete={onComplete} />);

    for (let i = 0; i < questions.length; i++) {
      const optionText = new RegExp(`Option ${correctSelections[i]}`, 'i');
      fireEvent.click(screen.getByText(optionText));
      fireEvent.click(screen.getByRole('button', { name: /Check Answer|See Results/i }));
      if (i < questions.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
      }
    }

    return onComplete;
  }

  it('calls onComplete with 100% when all answers are correct', () => {
    // SINGLE_Q correct = 'B'
    const onComplete = vi.fn();
    render(<QuizRenderer questions={SINGLE_Q} onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].overall_score).toBe(100);
  });

  it('calls onComplete with 0% when all answers are wrong', () => {
    const onComplete = vi.fn();
    render(<QuizRenderer questions={SINGLE_Q} onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Option A/)); // wrong (correct = B)
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].overall_score).toBe(0);
  });

  it('reports correct_count and total_questions', () => {
    const onComplete = vi.fn();
    render(<QuizRenderer questions={TWO_Q} onComplete={onComplete} />);

    // Q1 correct = B — answer B (correct)
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    // Q2 correct = A — answer C (wrong)
    fireEvent.click(screen.getByText(/Option C/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));

    const result = onComplete.mock.calls[0][0];
    expect(result.correct_count).toBe(1);
    expect(result.total_questions).toBe(2);
    expect(result.overall_score).toBe(50);
  });

  it('calculates per-domain scores correctly', () => {
    const onComplete = vi.fn();
    // THREE_Q: q1=life_types(correct=B), q2=riders(correct=A), q3=health_insurance(correct=C)
    render(<QuizRenderer questions={THREE_Q} onComplete={onComplete} />);

    // Q1 (life_types): answer B ✓
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    // Q2 (riders): answer D ✗
    fireEvent.click(screen.getByText(/Option D/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    // Q3 (health_insurance): answer C ✓
    fireEvent.click(screen.getByText(/Option C/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));

    const result = onComplete.mock.calls[0][0];
    expect(result.domain_scores.life_types).toBe(100);
    expect(result.domain_scores.riders).toBe(0);
    expect(result.domain_scores.health_insurance).toBe(100);
  });

  it('groups multiple questions from the same domain in domain_scores', () => {
    const samedomainQ = [
      makeQuestion(1, 'A', 'life_types'),
      makeQuestion(2, 'B', 'life_types'),
    ];
    const onComplete = vi.fn();
    render(<QuizRenderer questions={samedomainQ} onComplete={onComplete} />);

    // Q1 (life_types): answer A ✓
    fireEvent.click(screen.getByText(/Option A/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    // Q2 (life_types): answer A ✗ (correct = B)
    fireEvent.click(screen.getByText(/Option A/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));

    // 1/2 correct in life_types = 50%
    expect(onComplete.mock.calls[0][0].domain_scores.life_types).toBe(50);
  });

  it('does not call onComplete if the quiz is not finished', () => {
    const onComplete = vi.fn();
    render(<QuizRenderer questions={TWO_Q} onComplete={onComplete} />);
    fireEvent.click(screen.getByText(/Option B/));
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
    // Did NOT click Next Question
    expect(onComplete).not.toHaveBeenCalled();
  });
});
