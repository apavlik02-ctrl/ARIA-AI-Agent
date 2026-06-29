// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingModal from '@/components/OnboardingModal';

const FUTURE_DATE = '2027-01-15';

function setup() {
  const onComplete = vi.fn();
  render(<OnboardingModal onComplete={onComplete} />);
  return { onComplete };
}

// ── Step 1 navigation helpers ─────────────────────────────────────────────────

function fillStep1() {
  fireEvent.change(screen.getByRole('textbox', { hidden: true }) as HTMLInputElement ||
    document.querySelector('input[type="date"]') as HTMLInputElement,
    { target: { value: FUTURE_DATE } }
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
}

// ── Step 1: Exam date & state ─────────────────────────────────────────────────

describe('OnboardingModal — step 1', () => {
  it('shows "When is your exam?" heading', () => {
    setup();
    expect(screen.getByText('When is your exam?')).toBeInTheDocument();
  });

  it('renders the ARIA brand label', () => {
    setup();
    expect(screen.getByText('ARIA')).toBeInTheDocument();
  });

  it('has a date input', () => {
    setup();
    expect(document.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('has a state combobox with placeholder', () => {
    setup();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Select your state')).toBeInTheDocument();
  });

  it('"Continue" is disabled before selecting date and state', () => {
    setup();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Continue" remains disabled if only exam date is set', () => {
    setup();
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: FUTURE_DATE } });
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Continue" remains disabled if only state is set', () => {
    setup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('"Continue" is enabled after selecting both date and state', () => {
    setup();
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: FUTURE_DATE } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
    expect(screen.getByRole('button', { name: /Continue/i })).not.toBeDisabled();
  });

  it('clicking "Continue" advances to step 2', () => {
    setup();
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: FUTURE_DATE } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText('What are you studying for?')).toBeInTheDocument();
  });
});

// ── Step 2: License type ──────────────────────────────────────────────────────

describe('OnboardingModal — step 2', () => {
  function goToStep2() {
    const { onComplete } = setup();
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: FUTURE_DATE } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    return { onComplete };
  }

  it('shows "What are you studying for?" heading', () => {
    goToStep2();
    expect(screen.getByText('What are you studying for?')).toBeInTheDocument();
  });

  it('shows all four license type options', () => {
    goToStep2();
    expect(screen.getByText('Life & Health')).toBeInTheDocument();
    expect(screen.getByText('Life Only')).toBeInTheDocument();
    expect(screen.getByText('Health Only')).toBeInTheDocument();
    expect(screen.getByText('Property & Casualty')).toBeInTheDocument();
  });

  it('"← Back" returns to step 1', () => {
    goToStep2();
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('When is your exam?')).toBeInTheDocument();
  });

  it('"Continue →" advances to step 3', () => {
    goToStep2();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText('How ready do you feel?')).toBeInTheDocument();
  });

  it('clicking a license type selects it without throwing', () => {
    goToStep2();
    expect(() => fireEvent.click(screen.getByText('Life Only'))).not.toThrow();
  });
});

// ── Step 3: Comfort level ─────────────────────────────────────────────────────

describe('OnboardingModal — step 3', () => {
  function goToStep3() {
    const { onComplete } = setup();
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement,
      { target: { value: FUTURE_DATE } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Texas' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    return { onComplete };
  }

  it('shows "How ready do you feel?" heading', () => {
    goToStep3();
    expect(screen.getByText('How ready do you feel?')).toBeInTheDocument();
  });

  it('shows all five comfort level options', () => {
    goToStep3();
    expect(screen.getByText('Very new to this')).toBeInTheDocument();
    expect(screen.getByText('Some background')).toBeInTheDocument();
    expect(screen.getByText('Moderate knowledge')).toBeInTheDocument();
    expect(screen.getByText('Fairly confident')).toBeInTheDocument();
    expect(screen.getByText('Almost ready')).toBeInTheDocument();
  });

  it('"← Back" returns to step 2', () => {
    goToStep3();
    // Use exact "← Back" text to avoid matching "Some background" comfort button
    fireEvent.click(screen.getByRole('button', { name: /← Back/i }));
    expect(screen.getByText('What are you studying for?')).toBeInTheDocument();
  });

  it('"Build my plan →" calls onComplete with the correct shape', () => {
    const { onComplete } = goToStep3();
    fireEvent.click(screen.getByRole('button', { name: /Build my plan/i }));
    expect(onComplete).toHaveBeenCalledOnce();
    const result = onComplete.mock.calls[0][0];
    expect(result.exam_date).toBe(FUTURE_DATE);
    expect(result.state).toBe('Texas');
    expect(result.exam_type).toBeDefined();
    expect(result.comfort_level).toBeGreaterThanOrEqual(1);
  });

  it('clicking a comfort level option does not throw', () => {
    goToStep3();
    expect(() => fireEvent.click(screen.getByText('Almost ready'))).not.toThrow();
  });

  it('onComplete includes the selected comfort level when changed', () => {
    const { onComplete } = goToStep3();
    fireEvent.click(screen.getByText('Almost ready')); // comfort = 5
    fireEvent.click(screen.getByRole('button', { name: /Build my plan/i }));
    expect(onComplete.mock.calls[0][0].comfort_level).toBe(5);
  });
});
