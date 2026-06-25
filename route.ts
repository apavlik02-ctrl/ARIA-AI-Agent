import { NextRequest, NextResponse } from 'next/server';

// ============================================
// ARIA Backend Adapter for PassPro
// ============================================
// This route acts as a smart proxy between the frontend
// and ARIA's capabilities (tools + Claude fallback).
//
// Place this at: app/api/aria/route.ts

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolResult {
  type: 'tool_result';
  tool: string;
  data: any;
  message?: string;
}

interface AriaResponse {
  content: string;
  toolResults?: ToolResult[];
  mode?: string;
}

// ============================================
// ARIA Tool Implementations (TypeScript port of simulator)
// ============================================

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

const SAMPLE_QUESTIONS = [
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
    domain: "policy_provisions",
    difficulty: "easy",
    question: "In Wisconsin, the standard grace period for life insurance policies is:",
    options: ["A) 10 days", "B) 30 days", "C) 31 days", "D) 60 days"],
    correct: "C",
    explanation: "Wisconsin statute sets the grace period at 31 days for life insurance.",
    know_this: "WI = 31 days (not 30). State-specific fact frequently tested.",
  },
  {
    id: 3,
    domain: "health_insurance",
    difficulty: "medium",
    question: "Which managed care plan typically requires a primary care physician (PCP) and referrals to see specialists?",
    options: ["A) PPO", "B) HMO", "C) POS", "D) EPO"],
    correct: "B",
    explanation: "HMOs use a gatekeeper model with PCPs and required referrals. PPOs offer more flexibility without referrals.",
    know_this: "HMO = gatekeeper + referrals. PPO = flexibility + higher out-of-network cost.",
  },
  {
    id: 4,
    domain: "riders",
    difficulty: "hard",
    question: "An Accelerated Death Benefit rider typically allows access to what percentage of the death benefit while the insured is still living?",
    options: ["A) 25%", "B) 50%", "C) Up to 100% in some cases", "D) Only the cash value"],
    correct: "C",
    explanation: "Many modern ADB/Living Benefit riders allow access to a significant portion (sometimes up to 100%) of the death benefit for terminal, chronic, or critical illness.",
    know_this: "ADB is also called Living Needs Benefit. Not the same as a viatical settlement.",
  },
  {
    id: 5,
    domain: "regulations",
    difficulty: "medium",
    question: "Inducing a policyowner to replace an existing policy with a new one through misrepresentation is called:",
    options: ["A) Churning", "B) Twisting", "C) Rebating", "D) Sliding"],
    correct: "B",
    explanation: "Twisting involves misrepresentation to induce replacement. Churning is excessive replacements primarily for commission.",
    know_this: "Twisting = misrepresentation. Churning = volume of replacements for commission.",
  },
  {
    id: 6,
    domain: "life_types",
    difficulty: "easy",
    question: "Which policy type builds guaranteed cash value?",
    options: ["A) Term Life", "B) Whole Life", "C) Annual Renewable Term", "D) Decreasing Term"],
    correct: "B",
    explanation: "Whole Life is a permanent policy with guaranteed cash value accumulation and level premiums.",
    know_this: "Whole Life = permanent + guaranteed cash value + level premium.",
  },
];

function getInsuranceRegulation(state: string, topic: string) {
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

function generatePracticeQuestions(domains: string[], count = 6, difficulty = "mixed", state = "Wisconsin") {
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

function analyzeReadiness(quizResults: any, examDate?: string, previousReadiness?: number) {
  const overall = quizResults.overall_score || 50;
  const domainScores = quizResults.domain_scores || {};

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(domainScores).forEach(([domain, score]: [string, any]) => {
    const weight = DOMAIN_WEIGHTS[domain] || 0.2;
    weightedScore += (score as number) * weight;
    totalWeight += weight;
  });

  const newReadiness = totalWeight > 0 
    ? Math.round((weightedScore / totalWeight) * 10) / 10 
    : overall;

  const weakDomains = Object.entries(domainScores)
    .filter(([_, score]) => (score as number) < 55)
    .map(([domain]) => domain);

  const priorityDomains = Object.entries(domainScores)
    .sort((a, b) => (a[1] as number) - (b[1] as number))
    .slice(0, 3)
    .map(([d]) => d);

  const recommendations: string[] = [];
  if (weakDomains.includes("riders")) recommendations.push("Focus on Accelerated Death Benefit and Waiver of Premium triggers");
  if (weakDomains.includes("health_insurance")) recommendations.push("Review HMO vs PPO differences and Medicare Parts A-D");
  if (weakDomains.includes("policy_provisions")) recommendations.push("Master grace period, free look, and incontestability by state");

  if (recommendations.length === 0) {
    recommendations.push("Continue balanced review with emphasis on identified weak domains");
  }

  const result: any = {
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

function createStudySchedule(examDate: string, currentReadiness = 50, weakDomains: string[] = [], dailyMinutes = 45) {
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

// ============================================
// Intent Detection (simple but effective)
// ============================================

function detectIntent(message: string): { tool?: string; params?: any } {
  const lower = message.toLowerCase();

  if (lower.includes("quiz") || lower.includes("practice question") || lower.includes("diagnostic")) {
    return { tool: "generate_practice_questions", params: { domains: ["life_types", "policy_provisions", "health_insurance", "riders", "regulations"], count: 6 } };
  }

  if (lower.includes("analyze") || lower.includes("readiness") || lower.includes("how am i doing")) {
    return { tool: "analyze_readiness", params: {} }; // expects quiz_results in context
  }

  if (lower.includes("study plan") || lower.includes("study schedule") || lower.includes("calendar")) {
    return { tool: "create_study_schedule", params: { exam_date: "2026-07-30" } };
  }

  if (lower.includes("grace period") || lower.includes("free look") || lower.includes("incontestability") || lower.includes("replacement") && lower.includes("wisconsin")) {
    const topic = lower.includes("grace") ? "grace_period" : 
                  lower.includes("free look") ? "free_look" : 
                  lower.includes("incontestab") ? "incontestability" : "replacement";
    return { tool: "get_insurance_regulation", params: { state: "Wisconsin", topic } };
  }

  return {};
}

// ============================================
// Intent Detection (improved)
// ============================================

function detectIntent(message: string): { tool?: string; params?: any } {
  const lower = message.toLowerCase();

  // Quiz / Diagnostic
  if (lower.includes("quiz") || lower.includes("practice question") || 
      lower.includes("diagnostic") || lower.includes("test me")) {
    return { 
      tool: "generate_practice_questions", 
      params: { 
        domains: ["life_types", "policy_provisions", "health_insurance", "riders", "regulations"], 
        count: 6 
      } 
    };
  }

  // Readiness Analysis
  if (lower.includes("analyze") || lower.includes("readiness") || 
      lower.includes("how am i doing") || lower.includes("my score")) {
    return { tool: "analyze_readiness", params: {} };
  }

  // Study Schedule / Plan
  if (lower.includes("study plan") || lower.includes("study schedule") || 
      lower.includes("calendar") || lower.includes("plan for me")) {
    return { 
      tool: "create_study_schedule", 
      params: { exam_date: "2026-07-30" } 
    };
  }

  // Wisconsin Regulations
  if ((lower.includes("wisconsin") || lower.includes("wi ")) && 
      (lower.includes("grace") || lower.includes("free look") || 
       lower.includes("incontestab") || lower.includes("replacement"))) {
    const topic = lower.includes("grace") ? "grace_period" : 
                  lower.includes("free look") ? "free_look" : 
                  lower.includes("incontestab") ? "incontestability" : "replacement";
    return { tool: "get_insurance_regulation", params: { state: "Wisconsin", topic } };
  }

  return {};
}

// ============================================
// Claude Fallback (real API call)
// ============================================

async function callClaude(messages: Message[], systemPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return {
      type: "error",
      message: "ANTHROPIC_API_KEY is not configured. Please add it to your environment variables.",
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Claude API error");
    }

    const data = await response.json();
    const text = data.content?.find((b: any) => b.type === "text")?.text || "";

    return {
      type: "claude_response",
      content: text,
    };
  } catch (error: any) {
    return {
      type: "error",
      message: `Claude API error: ${error.message}`,
    };
  }
}

// ============================================
// Main API Route
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mode = "study", system } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: Message) => m.role === "user")?.content || "";
    const intent = detectIntent(lastUserMessage);

    // === Tool Execution Path ===
    if (intent.tool) {
      let toolData: any;
      let message = "";

      switch (intent.tool) {
        case "generate_practice_questions":
          toolData = generatePracticeQuestions(
            intent.params.domains,
            intent.params.count || 6,
            "mixed",
            "Wisconsin"
          );
          message = `Here’s a focused diagnostic quiz with ${toolData.length} questions.`;
          break;

        case "analyze_readiness":
          const sampleResults = {
            overall_score: 61,
            domain_scores: {
              life_types: 75,
              policy_provisions: 48,
              health_insurance: 42,
              riders: 35,
              regulations: 78,
            },
          };
          toolData = analyzeReadiness(sampleResults, "2026-07-30", 55);
          message = "Readiness analysis complete.";
          break;

        case "create_study_schedule":
          toolData = createStudySchedule(
            intent.params.exam_date || "2026-07-30",
            58,
            ["riders", "health_insurance", "policy_provisions"],
            50
          );
          message = "Personalized study schedule generated.";
          break;

        case "get_insurance_regulation":
          toolData = getInsuranceRegulation(intent.params.state, intent.params.topic);
          message = `Wisconsin regulation details for ${intent.params.topic.replace("_", " ")}.`;
          break;
      }

      return NextResponse.json({
        type: "tool_result",
        tool: intent.tool,
        data: toolData,
        message,
        mode,
      });
    }

    // === Claude Fallback ===
    const systemPrompt = system || 
      "You are ARIA, an expert AI study companion for the Wisconsin PSI insurance licensing exams.";

    const claudeResult = await callClaude(messages, systemPrompt);

    return NextResponse.json(claudeResult);

  } catch (error: any) {
    console.error("ARIA API Error:", error);
    return NextResponse.json(
      { 
        type: "error", 
        message: "Internal server error", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
