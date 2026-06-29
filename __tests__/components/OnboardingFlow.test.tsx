// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingFlow from '@/components/OnboardingFlow';

function setup() {
  const onComplete = vi.fn();
  render(<OnboardingFlow onComplete={onComplete} />);
  return { onComplete };
}

// Helper: the two selects on step 2 have no htmlFor, so grab by index
function examTypeSelect() { return screen.getAllByRole('combobox')[0]; }
function stateSelect()    { return screen.getAllByRole('combobox')[1]; }

// ── Step 1: Welcome ───────────────────────────────────────────────────────────

describe('OnboardingFlow — step 1 (welcome)', () => {
  it('renders the welcome heading', () => {
    setup();
    expect(screen.getByText('Welcome to ARIA')).toBeInTheDocument();
  });

  it('shows "Step 1 of 5"', () => {
    setup();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('has a "Let\'s get started" button', () => {
    setup();
    expect(screen.getByRole('button', { name: /Let's get started/i })).toBeInTheDocument();
  });

  it('clicking "Let\'s get started" advances to step 2', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    expect(screen.getByText('Tell us about your exam')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });
});

// ── Step 2: Exam details ──────────────────────────────────────────────────────

describe('OnboardingFlow — step 2 (exam details)', () => {
  function goToStep2() {
    const { onComplete } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    return { onComplete };
  }

  it('renders two comboboxes (exam type + state)', () => {
    goToStep2();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('"Continue" is disabled before selecting exam type and state', () => {
    goToStep2();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Continue" is enabled after selecting both exam type and state', () => {
    goToStep2();
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    fireEvent.change(stateSelect(), { target: { value: 'California' } });
    expect(screen.getByRole('button', { name: /Continue/i })).not.toBeDisabled();
  });

  it('"Continue" remains disabled if only exam type is set', () => {
    goToStep2();
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Continue" remains disabled if only state is set', () => {
    goToStep2();
    fireEvent.change(stateSelect(), { target: { value: 'California' } });
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Back" returns to step 1', () => {
    goToStep2();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('Welcome to ARIA')).toBeInTheDocument();
  });

  it('advancing to step 3 shows the readiness heading', () => {
    goToStep2();
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    fireEvent.change(stateSelect(), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/How are you feeling about the exam/i)).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
  });
});

// ── Step 3: Self assessment ───────────────────────────────────────────────────

describe('OnboardingFlow — step 3 (self assessment)', () => {
  function goToStep3() {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    fireEvent.change(stateSelect(), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  }

  it('shows the readiness range slider', () => {
    goToStep3();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows all weak area options', () => {
    goToStep3();
    expect(screen.getByText('Life Insurance Types')).toBeInTheDocument();
    expect(screen.getByText('Annuities')).toBeInTheDocument();
    expect(screen.getByText('State Regulations')).toBeInTheDocument();
  });

  it('can select and deselect a weak area', () => {
    goToStep3();
    const annuities = screen.getByText('Annuities');
    fireEvent.click(annuities);  // select
    fireEvent.click(annuities);  // deselect
    expect(screen.getByText('Annuities')).toBeInTheDocument(); // still rendered
  });

  it('can select multiple weak areas simultaneously', () => {
    goToStep3();
    fireEvent.click(screen.getByText('Annuities'));
    fireEvent.click(screen.getByText('State Regulations'));
    // Both should remain in the DOM (not mutually exclusive)
    expect(screen.getByText('Annuities')).toBeInTheDocument();
    expect(screen.getByText('State Regulations')).toBeInTheDocument();
  });

  it('"Continue" is always enabled (weak areas optional)', () => {
    goToStep3();
    expect(screen.getByRole('button', { name: /Continue/i })).not.toBeDisabled();
  });

  it('"Back" returns to step 2', () => {
    goToStep3();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('Tell us about your exam')).toBeInTheDocument();
  });
});

// ── Step 4: Study habits ──────────────────────────────────────────────────────

describe('OnboardingFlow — step 4 (study habits)', () => {
  function goToStep4() {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    fireEvent.change(stateSelect(), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  }

  it('shows study time heading', () => {
    goToStep4();
    expect(screen.getByText(/How much time can you study/i)).toBeInTheDocument();
  });

  it('shows all four time options', () => {
    goToStep4();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('shows "Step 4 of 5"', () => {
    goToStep4();
    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
  });

  it('clicking a time option does not throw', () => {
    goToStep4();
    expect(() => fireEvent.click(screen.getByText('60 min'))).not.toThrow();
  });

  it('"Create my plan" advances to step 5', () => {
    goToStep4();
    fireEvent.click(screen.getByRole('button', { name: /Create my plan/i }));
    expect(screen.getByText(/Your personalized plan is ready/i)).toBeInTheDocument();
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
  });

  it('"Back" returns to step 3', () => {
    goToStep4();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText(/How are you feeling about the exam/i)).toBeInTheDocument();
  });
});

// ── Step 5: Summary & completion ─────────────────────────────────────────────

describe('OnboardingFlow — step 5 (summary)', () => {
  function goToStep5(weakAreas: string[] = []) {
    const { onComplete } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    fireEvent.change(examTypeSelect(), { target: { value: 'Life + Health Combined' } });
    fireEvent.change(stateSelect(), { target: { value: 'Florida' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    weakAreas.forEach(area => fireEvent.click(screen.getByText(area)));

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create my plan/i }));
    return { onComplete };
  }

  it('shows the exam type in the summary', () => {
    goToStep5();
    expect(screen.getByText(/Life \+ Health Combined/)).toBeInTheDocument();
  });

  it('shows the selected state in the summary', () => {
    goToStep5();
    expect(screen.getByText(/Florida/)).toBeInTheDocument();
  });

  it('shows the starting readiness percentage', () => {
    goToStep5();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('shows daily study time in the summary', () => {
    goToStep5();
    expect(screen.getByText(/45 minutes/)).toBeInTheDocument();
  });

  it('shows focus areas when weak areas were selected', () => {
    goToStep5(['Annuities', 'State Regulations']);
    expect(screen.getByText(/Focus Areas/i)).toBeInTheDocument();
    expect(screen.getByText(/Annuities/)).toBeInTheDocument();
  });

  it('does not show focus areas section when no weak areas selected', () => {
    goToStep5([]);
    expect(screen.queryByText(/Focus Areas/i)).not.toBeInTheDocument();
  });

  it('calls onComplete with the correct data', () => {
    const { onComplete } = goToStep5(['Annuities']);
    fireEvent.click(screen.getByRole('button', { name: /Start my first quiz/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    const data = onComplete.mock.calls[0][0];
    expect(data.examType).toBe('Life + Health Combined');
    expect(data.state).toBe('Florida');
    expect(data.weakAreas).toContain('Annuities');
    expect(data.completedAt).toBeDefined();
  });

  it('onComplete data includes studyTimePerDay defaulting to 45', () => {
    const { onComplete } = goToStep5();
    fireEvent.click(screen.getByRole('button', { name: /Start my first quiz/i }));
    expect(onComplete.mock.calls[0][0].studyTimePerDay).toBe(45);
  });

  it('onComplete data includes the updated studyTimePerDay when changed on step 4', () => {
    // Navigate to step 4 manually to change study time, then complete
    const { onComplete } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Let's get started/i }));
    fireEvent.change(examTypeSelect(), { target: { value: 'Life Insurance' } });
    fireEvent.change(stateSelect(), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByText('90 min'));
    fireEvent.click(screen.getByRole('button', { name: /Create my plan/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start my first quiz/i }));

    expect(onComplete.mock.calls[0][0].studyTimePerDay).toBe(90);
  });
});
