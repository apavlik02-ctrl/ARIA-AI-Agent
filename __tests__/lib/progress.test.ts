import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  calculateNewReadiness,
  updateWeakDomains,
  updateStudyStreak,
  getDefaultProgress,
} from '@/lib/progress';

describe('calculateNewReadiness', () => {
  it('blends previous readiness and quiz score at the default 0.3 weight', () => {
    const result = calculateNewReadiness(60, { overall_score: 80, domain_scores: {}, weak_domains: [] });
    // 60 * 0.7 + 80 * 0.3 = 42 + 24 = 66
    expect(result).toBe(66);
  });

  it('respects a custom weight', () => {
    const result = calculateNewReadiness(50, { overall_score: 100, domain_scores: {}, weak_domains: [] }, 0.5);
    // 50 * 0.5 + 100 * 0.5 = 75
    expect(result).toBe(75);
  });

  it('clamps the result to a maximum of 100', () => {
    const result = calculateNewReadiness(100, { overall_score: 100, domain_scores: {}, weak_domains: [] });
    expect(result).toBe(100);
  });

  it('clamps the result to a minimum of 0', () => {
    const result = calculateNewReadiness(0, { overall_score: 0, domain_scores: {}, weak_domains: [] });
    expect(result).toBe(0);
  });

  it('rounds to the nearest integer', () => {
    // 45 * 0.7 + 72 * 0.3 = 31.5 + 21.6 = 53.1 → rounds to 53
    const result = calculateNewReadiness(45, { overall_score: 72, domain_scores: {}, weak_domains: [] });
    expect(result).toBe(53);
  });

  it('handles a large drop in quiz score correctly', () => {
    // 90 * 0.7 + 10 * 0.3 = 63 + 3 = 66
    const result = calculateNewReadiness(90, { overall_score: 10, domain_scores: {}, weak_domains: [] });
    expect(result).toBe(66);
  });
});

describe('updateWeakDomains', () => {
  it('marks domains with score below 55 as weak', () => {
    const result = updateWeakDomains([], { riders: 40, life_types: 70, health_insurance: 50 });
    expect(result).toContain('riders');
    expect(result).toContain('health_insurance');
    expect(result).not.toContain('life_types');
  });

  it('removes domains from the weak list once they score 55 or above', () => {
    const result = updateWeakDomains(['riders', 'life_types'], { riders: 80, life_types: 60 });
    expect(result).not.toContain('riders');
    expect(result).not.toContain('life_types');
  });

  it('retains previously weak domains that were not tested in this quiz', () => {
    const result = updateWeakDomains(['health_insurance', 'annuities'], { riders: 40 });
    expect(result).toContain('health_insurance');
    expect(result).toContain('annuities');
    expect(result).toContain('riders');
  });

  it('deduplicates domains that appear in both existing and new weak lists', () => {
    const result = updateWeakDomains(['riders'], { riders: 30 });
    const riderCount = result.filter(d => d === 'riders').length;
    expect(riderCount).toBe(1);
  });

  it('caps the result at 5 domains', () => {
    const existing = ['annuities', 'qualified_plans'];
    const domainScores = {
      life_types: 20,
      policy_provisions: 30,
      health_insurance: 40,
      riders: 50,
      regulations: 10,
    };
    const result = updateWeakDomains(existing, domainScores);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('returns an empty list when all tested domains score 55 or above and no prior weak domains exist', () => {
    const result = updateWeakDomains([], { riders: 55, life_types: 90 });
    expect(result).toEqual([]);
  });

  it('treats a score of exactly 55 as passing (not weak)', () => {
    const result = updateWeakDomains([], { riders: 55 });
    expect(result).not.toContain('riders');
  });

  it('treats a score of 54 as still weak', () => {
    const result = updateWeakDomains([], { riders: 54 });
    expect(result).toContain('riders');
  });
});

describe('updateStudyStreak', () => {
  const TODAY = '2026-06-29';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(TODAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 1 when there is no previous study date', () => {
    expect(updateStudyStreak(5)).toBe(1);
  });

  it('returns the existing streak when the last study date is today', () => {
    expect(updateStudyStreak(7, TODAY)).toBe(7);
  });

  it('increments the streak by 1 when the last study date was yesterday', () => {
    expect(updateStudyStreak(4, '2026-06-28')).toBe(5);
  });

  it('resets the streak to 1 when the gap is more than one day', () => {
    expect(updateStudyStreak(10, '2026-06-27')).toBe(1);
  });

  it('resets the streak to 1 after a long absence', () => {
    expect(updateStudyStreak(30, '2026-01-01')).toBe(1);
  });
});

describe('getDefaultProgress', () => {
  it('returns a progress object for the given user id', () => {
    const progress = getDefaultProgress('user-123');
    expect(progress.user_id).toBe('user-123');
  });

  it('starts with a readiness of 45', () => {
    const progress = getDefaultProgress('user-123');
    expect(progress.current_readiness).toBe(45);
  });

  it('initialises with the expected default weak domains', () => {
    const progress = getDefaultProgress('user-123');
    expect(progress.weak_domains).toEqual(['riders', 'health_insurance']);
  });

  it('starts with an empty quiz history', () => {
    const progress = getDefaultProgress('user-123');
    expect(progress.quiz_history).toEqual([]);
  });

  it('starts with a study streak of 0', () => {
    const progress = getDefaultProgress('user-123');
    expect(progress.study_streak).toBe(0);
  });

  it('includes a valid ISO timestamp for updated_at', () => {
    const progress = getDefaultProgress('user-123');
    expect(() => new Date(progress.updated_at)).not.toThrow();
    expect(new Date(progress.updated_at).toISOString()).toBe(progress.updated_at);
  });
});
