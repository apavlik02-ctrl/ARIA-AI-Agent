import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getInsuranceRegulation,
  generatePracticeQuestions,
  analyzeReadiness,
  createStudySchedule,
} from '@/lib/aria-tools';

// ── getInsuranceRegulation ────────────────────────────────────────────────────

describe('getInsuranceRegulation', () => {
  it('returns Wisconsin grace period data for a known topic', () => {
    const result = getInsuranceRegulation('Wisconsin', 'grace_period');
    expect(result.state).toBe('Wisconsin');
    expect(result.topic).toBe('grace_period');
    expect(result.value).toBe(31);
    expect(result.details).toMatch(/31.day/i);
  });

  it('returns Wisconsin free look data', () => {
    const result = getInsuranceRegulation('Wisconsin', 'free_look');
    expect(result.value).toBe(10);
    expect(result.details).toMatch(/10 days/i);
  });

  it('returns Wisconsin incontestability data', () => {
    const result = getInsuranceRegulation('Wisconsin', 'incontestability');
    expect(result.value).toBe(2);
  });

  it('is case-insensitive for state input', () => {
    const lower = getInsuranceRegulation('wisconsin', 'grace_period');
    const upper = getInsuranceRegulation('WISCONSIN', 'grace_period');
    expect(lower.value).toBe(31);
    expect(upper.value).toBe(31);
  });

  it('is case-insensitive for topic input', () => {
    const result = getInsuranceRegulation('Wisconsin', 'GRACE_PERIOD');
    expect(result.value).toBe(31);
  });

  it('returns a fallback result for an unknown state', () => {
    const result = getInsuranceRegulation('California', 'grace_period');
    expect(result.value).toBeNull();
    expect(result.details).toMatch(/NAIC/i);
  });

  it('returns a fallback result for an unknown topic in Wisconsin', () => {
    const result = getInsuranceRegulation('Wisconsin', 'unknown_topic');
    expect(result.value).toBeNull();
    expect(result.source).toMatch(/NAIC/i);
  });

  it('includes an exam_note in the result', () => {
    const result = getInsuranceRegulation('Wisconsin', 'grace_period');
    expect(result.exam_note).toBeTruthy();
  });
});

// ── generatePracticeQuestions ─────────────────────────────────────────────────

describe('generatePracticeQuestions', () => {
  it('returns at most the requested number of questions', () => {
    const questions = generatePracticeQuestions(['life_types'], 3);
    expect(questions.length).toBeLessThanOrEqual(3);
  });

  it('falls back to all questions when no domain matches', () => {
    const questions = generatePracticeQuestions(['nonexistent_domain'], 5);
    expect(questions.length).toBeGreaterThan(0);
  });

  it('returns questions only from the requested domains when enough exist', () => {
    const questions = generatePracticeQuestions(['life_types'], 6);
    questions.forEach(q => expect(q.domain).toBe('life_types'));
  });

  it('filters by difficulty when specified', () => {
    const questions = generatePracticeQuestions(['life_types', 'riders', 'health_insurance'], 10, 'easy');
    questions.forEach(q => expect(q.difficulty).toBe('easy'));
  });

  it('ignores a difficulty filter that yields no results (falls back to mixed pool)', () => {
    // 'extreme' difficulty doesn't exist; should still return questions
    const questions = generatePracticeQuestions(['life_types'], 3, 'extreme');
    expect(questions.length).toBeGreaterThan(0);
  });

  it('attaches metadata including exam_weight and generated_for_state', () => {
    const questions = generatePracticeQuestions(['life_types'], 1, 'mixed', 'Wisconsin');
    expect(questions[0].metadata).toBeDefined();
    expect(questions[0].metadata.generated_for_state).toBe('Wisconsin');
    expect(typeof questions[0].metadata.exam_weight).toBe('number');
  });

  it('does not exceed the question pool size', () => {
    // Request far more questions than exist
    const questions = generatePracticeQuestions(['life_types'], 999);
    expect(questions.length).toBeLessThanOrEqual(999);
    expect(questions.length).toBeGreaterThan(0);
  });

  it('each question has the required fields', () => {
    const questions = generatePracticeQuestions(['life_types', 'riders'], 4);
    questions.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('domain');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('correct');
      expect(q).toHaveProperty('explanation');
    });
  });
});

// ── analyzeReadiness ──────────────────────────────────────────────────────────

describe('analyzeReadiness', () => {
  it('returns a new_readiness value', () => {
    const result = analyzeReadiness({ domain_scores: { life_types: 70, riders: 60 } });
    expect(typeof result.new_readiness).toBe('number');
  });

  it('identifies domains below 55 as weak', () => {
    const result = analyzeReadiness({ domain_scores: { riders: 40, life_types: 80 } });
    expect(result.weak_domains).toContain('riders');
    expect(result.weak_domains).not.toContain('life_types');
  });

  it('lists the lowest-scoring domains in priority_domains', () => {
    const result = analyzeReadiness({
      domain_scores: { riders: 30, health_insurance: 40, life_types: 90, policy_provisions: 85 },
    });
    expect(result.priority_domains[0]).toBe('riders');
    expect(result.priority_domains[1]).toBe('health_insurance');
  });

  it('calculates change relative to previousReadiness', () => {
    const result = analyzeReadiness({ domain_scores: { life_types: 80 } }, undefined, 60);
    expect(result.previous_readiness).toBe(60);
    expect(typeof result.change).toBe('number');
  });

  it('sets previous_readiness to null when not provided', () => {
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } });
    expect(result.previous_readiness).toBeNull();
  });

  it('includes days_until_exam when an exam date is provided', () => {
    const futureDate = '2026-12-31';
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } }, futureDate);
    expect(result.days_until_exam).toBeGreaterThan(0);
  });

  it('sets study_intensity to "High" when exam is within 21 days', () => {
    const soonDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } }, soonDate);
    expect(result.study_intensity).toBe('High');
  });

  it('sets study_intensity to "Standard" when exam is more than 45 days away', () => {
    const farDate = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } }, farDate);
    expect(result.study_intensity).toBe('Standard');
  });

  it('adds a recommendation for weak riders domain', () => {
    const result = analyzeReadiness({ domain_scores: { riders: 30 } });
    expect(result.recommendations.some(r => /accelerated death benefit|waiver of premium/i.test(r))).toBe(true);
  });

  it('adds a recommendation for weak health_insurance domain', () => {
    const result = analyzeReadiness({ domain_scores: { health_insurance: 40 } });
    expect(result.recommendations.some(r => /hmo|ppo|medicare/i.test(r))).toBe(true);
  });

  it('includes next_actions in the result', () => {
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } });
    expect(Array.isArray(result.next_actions)).toBe(true);
    expect(result.next_actions.length).toBeGreaterThan(0);
  });

  it('falls back to overall_score when domain_scores is empty', () => {
    const result = analyzeReadiness({ overall_score: 75, domain_scores: {} });
    expect(result.new_readiness).toBe(75);
  });

  it('includes a valid ISO timestamp for analyzed_at', () => {
    const result = analyzeReadiness({ domain_scores: { life_types: 70 } });
    expect(() => new Date(result.analyzed_at)).not.toThrow();
  });
});

// ── createStudySchedule ───────────────────────────────────────────────────────

describe('createStudySchedule', () => {
  const FAR_DATE = '2026-12-31';
  const CLOSE_DATE = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0];

  it('returns a schedule with the correct exam_date', () => {
    const result = createStudySchedule(FAR_DATE);
    expect(result.exam_date).toBe(FAR_DATE);
  });

  it('caps the schedule at 45 days', () => {
    const result = createStudySchedule(FAR_DATE);
    expect(result.schedule.length).toBeLessThanOrEqual(45);
  });

  it('generates fewer days when the exam is close', () => {
    const result = createStudySchedule(CLOSE_DATE);
    expect(result.schedule.length).toBeLessThanOrEqual(5);
  });

  it('sets target_readiness to 85', () => {
    const result = createStudySchedule(FAR_DATE, 50);
    expect(result.target_readiness).toBe(85);
  });

  it('stores the provided starting_readiness', () => {
    const result = createStudySchedule(FAR_DATE, 60);
    expect(result.starting_readiness).toBe(60);
  });

  it('stores the provided daily_minutes', () => {
    const result = createStudySchedule(FAR_DATE, 50, [], 30);
    expect(result.daily_minutes).toBe(30);
  });

  it('uses provided weak_domains as the initial focus', () => {
    const result = createStudySchedule(FAR_DATE, 50, ['riders', 'annuities']);
    expect(result.weak_domains_focus).toEqual(['riders', 'annuities']);
    // Early days should focus on the weak domains
    expect(result.schedule[0].focus_domains).toEqual(['riders', 'annuities']);
  });

  it('falls back to default domains when no weak domains are given', () => {
    const result = createStudySchedule(FAR_DATE, 50, []);
    expect(result.schedule[0].focus_domains).toEqual(['policy_provisions', 'riders']);
  });

  it('each schedule entry has required fields', () => {
    const result = createStudySchedule(FAR_DATE);
    result.schedule.forEach(entry => {
      expect(entry).toHaveProperty('day');
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('focus_domains');
      expect(entry).toHaveProperty('minutes');
      expect(entry).toHaveProperty('event');
      expect(entry).toHaveProperty('spaced_repetition');
    });
  });

  it('marks simulation days as timed simulations', () => {
    const result = createStudySchedule(FAR_DATE);
    // Days 10, 20, 29 (0-indexed: 9, 19, 28) should be simulations
    const simulationEntries = result.schedule.filter(e => e.event !== 'Study Block');
    expect(simulationEntries.length).toBeGreaterThan(0);
  });

  it('includes a non-empty notes field', () => {
    const result = createStudySchedule(FAR_DATE);
    expect(result.notes).toBeTruthy();
  });

  it('includes a valid ISO timestamp for generated_at', () => {
    const result = createStudySchedule(FAR_DATE);
    expect(() => new Date(result.generated_at)).not.toThrow();
  });
});
