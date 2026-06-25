/**
 * ARIA Progress Tracking
 * 
 * Simple but powerful progress system for PassPro.
 * Stores per-user readiness, weak domains, exam date, and quiz history.
 * 
 * Recommended: Store in Supabase `aria_progress` table.
 */

export interface UserProgress {
  user_id: string;
  exam_date?: string;
  current_readiness: number;
  weak_domains: string[];
  last_quiz_score?: number;
  quiz_history: Array<{
    date: string;
    score: number;
    domain_scores: Record<string, number>;
  }>;
  study_streak: number;
  last_study_date?: string;
  updated_at: string;
}

export interface QuizResult {
  overall_score: number;
  domain_scores: Record<string, number>;
  weak_domains: string[];
}

/**
 * Calculate new readiness after a quiz
 */
export function calculateNewReadiness(
  previousReadiness: number,
  quizResult: QuizResult,
  weight: number = 0.3 // How much the new quiz affects overall readiness
): number {
  const quizReadiness = quizResult.overall_score;
  
  // Weighted average: keep some history + incorporate new result
  const newReadiness = Math.round(
    previousReadiness * (1 - weight) + quizReadiness * weight
  );
  
  return Math.max(0, Math.min(100, newReadiness));
}

/**
 * Update weak domains based on latest quiz
 */
export function updateWeakDomains(
  currentWeakDomains: string[],
  quizDomainScores: Record<string, number>
): string[] {
  const newWeak: string[] = [];
  
  Object.entries(quizDomainScores).forEach(([domain, score]) => {
    if (score < 55) {
      newWeak.push(domain);
    }
  });
  
  // Merge with existing weak domains (remove ones that improved)
  const improved = currentWeakDomains.filter(d => !newWeak.includes(d));
  
  return [...new Set([...newWeak, ...currentWeakDomains])].slice(0, 5);
}

/**
 * Update study streak
 */
export function updateStudyStreak(
  currentStreak: number,
  lastStudyDate?: string
): number {
  if (!lastStudyDate) return 1;
  
  const last = new Date(lastStudyDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 3600 * 24));
  
  if (diffDays === 0) {
    return currentStreak; // Already studied today
  } else if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1; // Streak broken
  }
}

/**
 * Default progress for new users
 */
export function getDefaultProgress(userId: string): UserProgress {
  return {
    user_id: userId,
    current_readiness: 45,
    weak_domains: ["riders", "health_insurance"],
    quiz_history: [],
    study_streak: 0,
    updated_at: new Date().toISOString(),
  };
}
