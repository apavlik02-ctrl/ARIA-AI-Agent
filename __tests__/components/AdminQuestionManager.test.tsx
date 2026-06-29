// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminQuestionManager from '@/components/AdminQuestionManager';

const sampleQuestion = {
  id: 1,
  domain: 'life_types',
  difficulty: 'medium',
  question: 'What is a whole life policy?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 'A',
  explanation: 'A whole life policy provides permanent coverage.',
  know_this: 'Permanent coverage',
};

// ── Header ────────────────────────────────────────────────────────────────────

describe('AdminQuestionManager — header', () => {
  it('shows "Question Bank Manager" heading', () => {
    render(<AdminQuestionManager />);
    expect(screen.getByText('Question Bank Manager')).toBeInTheDocument();
  });

  it('shows 0 question count when no initial questions', () => {
    render(<AdminQuestionManager />);
    expect(screen.getByText(/0 questions/)).toBeInTheDocument();
  });

  it('shows correct question count with initial questions', () => {
    render(<AdminQuestionManager initialQuestions={[sampleQuestion]} />);
    expect(screen.getByText(/1 questions/)).toBeInTheDocument();
  });

  it('shows the "+ Add Question" button by default', () => {
    render(<AdminQuestionManager />);
    expect(screen.getByRole('button', { name: /\+ Add Question/i })).toBeInTheDocument();
  });
});

// ── Form toggle ───────────────────────────────────────────────────────────────

describe('AdminQuestionManager — form toggle', () => {
  it('does not show the form initially', () => {
    render(<AdminQuestionManager />);
    expect(screen.queryByPlaceholderText('Question text')).not.toBeInTheDocument();
  });

  it('shows the form after clicking "+ Add Question"', () => {
    render(<AdminQuestionManager />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    expect(screen.getByPlaceholderText('Question text')).toBeInTheDocument();
  });

  it('button label changes to "Cancel" when form is open', () => {
    render(<AdminQuestionManager />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('clicking "Cancel" hides the form', () => {
    render(<AdminQuestionManager />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByPlaceholderText('Question text')).not.toBeInTheDocument();
  });

  it('shows all four option inputs in the form', () => {
    render(<AdminQuestionManager />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    expect(screen.getByPlaceholderText('Option A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option B')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option C')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option D')).toBeInTheDocument();
  });
});

// ── Question list ─────────────────────────────────────────────────────────────

describe('AdminQuestionManager — question list', () => {
  it('shows empty state when no questions exist', () => {
    render(<AdminQuestionManager />);
    expect(screen.getByText(/No questions yet/)).toBeInTheDocument();
  });

  it('renders existing questions from initialQuestions', () => {
    render(<AdminQuestionManager initialQuestions={[sampleQuestion]} />);
    expect(screen.getByText('What is a whole life policy?')).toBeInTheDocument();
  });

  it('renders domain and difficulty for each question', () => {
    render(<AdminQuestionManager initialQuestions={[sampleQuestion]} />);
    expect(screen.getByText(/life_types • medium/)).toBeInTheDocument();
  });

  it('renders the correct answer label', () => {
    render(<AdminQuestionManager initialQuestions={[sampleQuestion]} />);
    expect(screen.getByText(/Correct: A/)).toBeInTheDocument();
  });
});

// ── Adding questions ──────────────────────────────────────────────────────────

describe('AdminQuestionManager — adding questions', () => {
  function openForm() {
    render(<AdminQuestionManager onQuestionsChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
  }

  it('"Add to Question Bank" button does nothing if question text is empty', () => {
    openForm();
    fireEvent.change(screen.getByPlaceholderText('Correct answer (A, B, C, or D)'), {
      target: { value: 'A' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to Question Bank/i }));
    // Form should still be visible (not submitted)
    expect(screen.getByPlaceholderText('Question text')).toBeInTheDocument();
  });

  it('adds a new question and closes the form', () => {
    openForm();
    fireEvent.change(screen.getByPlaceholderText('Question text'), {
      target: { value: 'New test question?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Correct answer (A, B, C, or D)'), {
      target: { value: 'B' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to Question Bank/i }));

    expect(screen.getByText('New test question?')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Question text')).not.toBeInTheDocument();
  });

  it('calls onQuestionsChange after adding a question', () => {
    const onQuestionsChange = vi.fn();
    render(<AdminQuestionManager onQuestionsChange={onQuestionsChange} />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    fireEvent.change(screen.getByPlaceholderText('Question text'), {
      target: { value: 'Another question?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Correct answer (A, B, C, or D)'), {
      target: { value: 'C' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to Question Bank/i }));

    expect(onQuestionsChange).toHaveBeenCalledOnce();
    const updatedList = onQuestionsChange.mock.calls[0][0];
    expect(updatedList).toHaveLength(1);
    expect(updatedList[0].question).toBe('Another question?');
  });

  it('correct answer is uppercased on input', () => {
    const onQuestionsChange = vi.fn();
    render(<AdminQuestionManager onQuestionsChange={onQuestionsChange} />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    fireEvent.change(screen.getByPlaceholderText('Question text'), {
      target: { value: 'Q?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Correct answer (A, B, C, or D)'), {
      target: { value: 'b' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to Question Bank/i }));

    const q = onQuestionsChange.mock.calls[0][0][0];
    expect(q.correct).toBe('B');
  });

  it('updates the question count after adding a question', () => {
    render(<AdminQuestionManager />);
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Question/i }));
    fireEvent.change(screen.getByPlaceholderText('Question text'), {
      target: { value: 'Count test question?' },
    });
    fireEvent.change(screen.getByPlaceholderText('Correct answer (A, B, C, or D)'), {
      target: { value: 'D' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to Question Bank/i }));

    expect(screen.getByText(/1 questions/)).toBeInTheDocument();
  });
});
