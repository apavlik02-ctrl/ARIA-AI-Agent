/**
 * ARIA Tools Library
 * 
 * Reusable TypeScript implementations of ARIA's core tools.
 * Use this in your Next.js app for consistent behavior across API routes,
 * server components, and client-side logic.
 * 
 * Location suggestion: lib/aria-tools.ts
 */

export interface Question {
  id: number;
  domain: string;
  difficulty: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  know_this: string;
  metadata?: any;
}

export interface ReadinessAnalysis {
  previous_readiness: number | null;
  new_readiness: number;
  change: number;
  domain_breakdown: Record<string, number>;
  weak_domains: string[];
  priority_domains: string[];
  recommendations: string[];
  next_actions: string[];
  days_until_exam?: number;
  study_intensity?: string;
  analyzed_at: string;
}

export interface StudySchedule {
  exam_date: string;
  days_until_exam: number;
  starting_readiness: number;
  target_readiness: number;
  daily_minutes: number;
  weak_domains_focus: string[];
  schedule: Array<{
    day: number;
    date: string;
    focus_domains: string[];
    minutes: number;
    event: string;
    spaced_repetition: boolean;
  }>;
  generated_at: string;
  notes: string;
}

export interface RegulationResult {
  state: string;
  topic: string;
  value: number | null;
  details: string;
  exam_note: string;
  source: string;
}

// Domain weights for readiness calculation
const DOMAIN_WEIGHTS: Record<string, number> = {
  life_types: 0.28,
  policy_provisions: 0.22,
  health_insurance: 0.25,
  riders: 0.15,
  regulations: 0.10,
  annuities: 0.10,
  federal_tax: 0.07,
  qualified_plans: 0.07,
};

const WI_REGULATIONS: Record<string, any> = {
  grace_period: {
    days: 31,
    details: "Wisconsin requires a 31-day grace period for life insurance policies.",
    exam_note: "WI uses 31 days (some states use 30). Important state-specific fact.",
  },
  free_look: {
    days: 10,
    details: "Standard free-look period in Wisconsin is 10 days for individual life policies (30 days for replacements).",
    exam_note: "Free look is 10 days standard, longer for replacements.",
  },
  incontestability: {
    years: 2,
    details: "Incontestability period is 2 years in Wisconsin.",
    exam_note: "Standard 2-year incontestability clause.",
  },
  replacement: {
    details: "Wisconsin has strict replacement rules. A comparison document is required, and a 20-30 day free look often applies to replaced policies.",
    exam_note: "Replacement triggers additional disclosures and longer free look.",
  },
};

const SAMPLE_QUESTIONS: Question[] = [
  // Life Types
  {
    id: 1,
    domain: "life_types",
    difficulty: "medium",
    question: "Which type of life insurance provides the greatest amount of protection for the lowest initial premium?",
    options: ["A) Whole Life", "B) Level Term", "C) Universal Life", "D) Variable Universal Life"],
    correct: "B",
    explanation: "Level Term is pure protection with no cash value, making it the least expensive for a given death benefit amount.",
    know_this: "Term = highest death benefit per premium dollar in early years.",
  },
  {
    id: 2,
    domain: "life_types",
    difficulty: "easy",
    question: "Which policy type builds guaranteed cash value?",
    options: ["A) Term Life", "B) Whole Life", "C) Annual Renewable Term", "D) Decreasing Term"],
    correct: "B",
    explanation: "Whole Life is a permanent policy with guaranteed cash value accumulation and level premiums.",
    know_this: "Whole Life = permanent + guaranteed cash value + level premium.",
  },
  {
    id: 7,
    domain: "life_types",
    difficulty: "hard",
    question: "In Universal Life Option B, the death benefit is equal to:",
    options: ["A) The face amount only", "B) The face amount plus the cash value", "C) The cash value only", "D) The premiums paid plus interest"],
    correct: "B",
    explanation: "Option B (Increasing) pays the face amount plus the current cash value at death.",
    know_this: "Option B = Face + Cash Value. Option A = Level face amount.",
  },

  // Policy Provisions
  {
    id: 3,
    domain: "policy_provisions",
    difficulty: "easy",
    question: "In Wisconsin, the standard grace period for life insurance policies is:",
    options: ["A) 10 days", "B) 30 days", "C) 31 days", "D) 60 days"],
    correct: "C",
    explanation: "Wisconsin statute sets the grace period at 31 days for life insurance.",
    know_this: "WI = 31 days (not 30). State-specific fact frequently tested.",
  },
  {
    id: 8,
    domain: "policy_provisions",
    difficulty: "medium",
    question: "The incontestability clause generally prevents the insurer from contesting the policy after how many years?",
    options: ["A) 1 year", "B) 2 years", "C) 3 years", "D) 5 years"],
    correct: "B",
    explanation: "Most states, including Wisconsin, use a 2-year incontestability period.",
    know_this: "Incontestability = 2 years standard. Fraud is still contestable after this period in many states.",
  },

  // Health Insurance
  {
    id: 4,
    domain: "health_insurance",
    difficulty: "medium",
    question: "Which managed care plan typically requires a primary care physician (PCP) and referrals to see specialists?",
    options: ["A) PPO", "B) HMO", "C) POS", "D) EPO"],
    correct: "B",
    explanation: "HMOs use a gatekeeper model with PCPs and required referrals. PPOs offer more flexibility without referrals.",
    know_this: "HMO = gatekeeper + referrals. PPO = flexibility + higher out-of-network cost.",
  },
  {
    id: 9,
    domain: "health_insurance",
    difficulty: "hard",
    question: "Under an Own-Occupation disability definition, benefits are paid if the insured cannot perform the duties of:",
    options: ["A) Any occupation", "B) Their own occupation", "C) A similar occupation", "D) Any occupation they are suited for by education"],
    correct: "B",
    explanation: "Own-Occupation is the most favorable definition for the insured — they receive benefits if they can't do their specific job.",
    know_this: "Own-Occ = broadest protection (most expensive). Any-Occ = narrower (cheaper for insurer).",
  },

  // Riders
  {
    id: 5,
    domain: "riders",
    difficulty: "hard",
    question: "An Accelerated Death Benefit rider typically allows access to what percentage of the death benefit while the insured is still living?",
    options: ["A) 25%", "B) 50%", "C) Up to 100% in some cases", "D) Only the cash value"],
    correct: "C",
    explanation: "Many modern ADB/Living Benefit riders allow access to a significant portion (sometimes up to 100%) of the death benefit for terminal, chronic, or critical illness.",
    know_this: "ADB is also called Living Needs Benefit. Not the same as a viatical settlement.",
  },
  {
    id: 10,
    domain: "riders",
    difficulty: "medium",
    question: "The Waiver of Premium rider typically becomes effective after the insured has been disabled for how long?",
    options: ["A) 30 days", "B) 90 days", "C) 6 months", "D) 1 year"],
    correct: "C",
    explanation: "Most Waiver of Premium riders have a 6-month elimination period before premiums are waived.",
    know_this: "Common waiting period for Waiver of Premium is 6 months.",
  },

  // Regulations
  {
    id: 6,
    domain: "regulations",
    difficulty: "medium",
    question: "Inducing a policyowner to replace an existing policy with a new one through misrepresentation is called:",
    options: ["A) Churning", "B) Twisting", "C) Rebating", "D) Sliding"],
    correct: "B",
    explanation: "Twisting involves misrepresentation to induce replacement. Churning is excessive replacements primarily for commission.",
    know_this: "Twisting = misrepresentation. Churning = volume of replacements for commission.",
  },
  {
    id: 11,
    domain: "regulations",
    difficulty: "easy",
    question: "Which of the following is prohibited under Wisconsin insurance law?",
    options: ["A) Twisting", "B) Rebating", "C) Churning", "D) All of the above"],
    correct: "D",
    explanation: "Twisting, churning, and rebating are all unfair trade practices prohibited in Wisconsin.",
    know_this: "All three (Twisting, Churning, Rebating) are prohibited unfair trade practices.",
  },
];

/**
 * Get Wisconsin (or general) insurance regulation
 */
export function getInsuranceRegulation(state: string, topic: string): RegulationResult {
  const normalizedState = state.toLowerCase();
  const normalizedTopic = topic.toLowerCase();

  if (normalizedState === "wisconsin" && WI_REGULATIONS[normalizedTopic]) {
    const data = WI_REGULATIONS[normalizedTopic];
    return {
      state: "Wisconsin",
      topic: normalizedTopic,
      value: data.days || data.years || null,
      details: data.details,
      exam_note: data.exam_note,
      source: "Wisconsin OCI (simulated)",
    };
  }

  return {
    state,
    topic: normalizedTopic,
    value: null,
    details: "General NAIC guidance applies. Verify with current state DOI.",
    exam_note: "State variations exist — always confirm with official sources for the exam.",
    source: "NAIC Model + Simulator",
  };
}

/**
 * Generate practice questions
 */
export function generatePracticeQuestions(
  domains: string[],
  count: number = 6,
  difficulty: string = "mixed",
  state: string = "Wisconsin"
): Question[] {
  let pool = SAMPLE_QUESTIONS.filter(q => domains.includes(q.domain));

  if (pool.length === 0) pool = SAMPLE_QUESTIONS;

  if (difficulty !== "mixed") {
    const filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }

  const selected = pool.sort(() => 0.5 - Math.random()).slice(0, Math.min(count, pool.length));

  return selected.map(q => ({
    ...q,
    metadata: {
      generated_for_state: state,
      exam_weight: DOMAIN_WEIGHTS[q.domain] || 0.2,
      recommended_review: q.know_this,
      passpro_tags: [q.domain, q.difficulty],
    },
  }));
}

/**
 * Analyze quiz results and return readiness metrics
 */
export function analyzeReadiness(
  quizResults: { overall_score?: number; domain_scores: Record<string, number> },
  examDate?: string,
  previousReadiness?: number
): ReadinessAnalysis {
  const overall = quizResults.overall_score || 50;
  const domainScores = quizResults.domain_scores || {};

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(domainScores).forEach(([domain, score]) => {
    const weight = DOMAIN_WEIGHTS[domain] || 0.2;
    weightedScore += score * weight;
    totalWeight += weight;
  });

  const newReadiness = totalWeight > 0 
    ? Math.round((weightedScore / totalWeight) * 10) / 10 
    : overall;

  const weakDomains = Object.entries(domainScores)
    .filter(([_, score]) => score < 55)
    .map(([domain]) => domain);

  const priorityDomains = Object.entries(domainScores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([d]) => d);

  const recommendations: string[] = [];
  if (weakDomains.includes("riders")) recommendations.push("Focus on Accelerated Death Benefit and Waiver of Premium triggers");
  if (weakDomains.includes("health_insurance")) recommendations.push("Review HMO vs PPO differences and Medicare Parts A-D");
  if (weakDomains.includes("policy_provisions")) recommendations.push("Master grace period, free look, and incontestability by state");

  if (recommendations.length === 0) {
    recommendations.push("Continue balanced review with emphasis on identified weak domains");
  }

  const result: ReadinessAnalysis = {
    previous_readiness: previousReadiness ?? null,
    new_readiness: newReadiness,
    change: previousReadiness ? Math.round((newReadiness - previousReadiness) * 10) / 10 : 0,
    domain_breakdown: domainScores,
    weak_domains: weakDomains,
    priority_domains: priorityDomains,
    recommendations,
    next_actions: [
      "Review explanations for missed questions",
      "Schedule targeted practice on weak domains this week",
      "Run a full timed simulation in 7–10 days",
    ],
    analyzed_at: new Date().toISOString(),
  };

  if (examDate) {
    const exam = new Date(examDate);
    const daysLeft = Math.max(Math.ceil((exam.getTime() - Date.now()) / (1000 * 3600 * 24)), 0);
    result.days_until_exam = daysLeft;
    result.study_intensity = daysLeft < 21 ? "High" : daysLeft < 45 ? "Medium" : "Standard";
  }

  return result;
}

/**
 * Create a personalized study schedule
 */
export function createStudySchedule(
  examDate: string,
  currentReadiness: number = 50,
  weakDomains: string[] = [],
  dailyMinutes: number = 45
): StudySchedule {
  const exam = new Date(examDate);
  const today = new Date();
  const daysUntilExam = Math.max(Math.ceil((exam.getTime() - today.getTime()) / (1000 * 3600 * 24)), 1);

  const schedule = [];
  const focusAreas = weakDomains.length > 0 ? weakDomains : ["policy_provisions", "riders"];

  for (let day = 0; day < Math.min(daysUntilExam, 45); day++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + day);

    let focus = [...focusAreas];
    if (day > 10) focus = ["life_types", "annuities", "regulations"];
    if (day > 20) focus = ["mixed_review", "full_simulation"];

    const event = [9, 19, 28].includes(day) ? "Full Timed Simulation + Review" : "Study Block";

    schedule.push({
      day: day + 1,
      date: currentDay.toISOString().split("T")[0],
      focus_domains: focus,
      minutes: dailyMinutes,
      event,
      spaced_repetition: day % 3 === 0,
    });
  }

  return {
    exam_date: examDate,
    days_until_exam: daysUntilExam,
    starting_readiness: currentReadiness,
    target_readiness: 85,
    daily_minutes: dailyMinutes,
    weak_domains_focus: weakDomains,
    schedule,
    generated_at: new Date().toISOString(),
    notes: "Adjust daily_minutes based on your schedule. Re-run analysis after major assessments.",
  };
}
