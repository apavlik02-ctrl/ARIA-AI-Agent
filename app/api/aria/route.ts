import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import {
  getDefaultProgress,
  calculateNewReadiness,
  updateWeakDomains,
  updateStudyStreak,
  UserProgress,
} from '@/lib/progress';
import {
  generatePracticeQuestions,
  analyzeReadiness,
  createStudySchedule,
  getInsuranceRegulation,
} from '@/lib/aria-tools';

// Initialize Supabase (service role key preferred; falls back to anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper: Get or create user progress
async function getOrCreateProgress(userId: string): Promise<UserProgress> {
  const { data, error } = await supabase
    .from('aria_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) return data as UserProgress;

  const defaultProgress = getDefaultProgress(userId);
  await supabase.from('aria_progress').insert(defaultProgress);
  return defaultProgress;
}

// Helper: Update progress after a quiz
async function updateProgressAfterQuiz(
  userId: string,
  currentProgress: UserProgress,
  quizResult: {
    overall_score: number;
    domain_scores: Record<string, number>;
  }
) {
  const newReadiness = calculateNewReadiness(
    currentProgress.current_readiness,
    {
      overall_score: quizResult.overall_score,
      domain_scores: quizResult.domain_scores,
      weak_domains: [],
    }
  );

  const newWeakDomains = updateWeakDomains(
    currentProgress.weak_domains,
    quizResult.domain_scores
  );

  const newStreak = updateStudyStreak(
    currentProgress.study_streak,
    currentProgress.last_study_date
  );

  const quizEntry = {
    date: new Date().toISOString(),
    score: quizResult.overall_score,
    domain_scores: quizResult.domain_scores,
  };

  const updatedHistory = [...(currentProgress.quiz_history || []), quizEntry].slice(-10);

  const { error } = await supabase
    .from('aria_progress')
    .update({
      current_readiness: newReadiness,
      weak_domains: newWeakDomains,
      last_quiz_score: quizResult.overall_score,
      quiz_history: updatedHistory,
      study_streak: newStreak,
      last_study_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to update progress:', error);
  }

  return {
    new_readiness: newReadiness,
    weak_domains: newWeakDomains,
    study_streak: newStreak,
  };
}

// Intent detection (same as before, slightly enhanced)
function detectIntent(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes('quiz') || lower.includes('practice question') || lower.includes('diagnostic')) {
    return { tool: 'generate_practice_questions' };
  }
  if (lower.includes('analyze') || lower.includes('readiness') || lower.includes('how am i doing')) {
    return { tool: 'analyze_readiness' };
  }
  if (lower.includes('study plan') || lower.includes('study schedule')) {
    return { tool: 'create_study_schedule' };
  }
  if (lower.includes('wisconsin') && (lower.includes('grace') || lower.includes('free look'))) {
    return { tool: 'get_insurance_regulation', params: { state: 'Wisconsin', topic: 'grace_period' } };
  }
  return {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mode = 'study', userId, action, payload } = body;

    // === Handle Quiz Result Submission (for updating progress) ===
    if (action === 'submit_quiz_result' && userId && payload) {
      const progress = await getOrCreateProgress(userId);
      const updated = await updateProgressAfterQuiz(userId, progress, payload.quizResult);

      return NextResponse.json({
        type: 'progress_updated',
        data: updated,
        message: `Great job! Your new readiness is ${updated.new_readiness}%.`,
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((m: Message) => m.role === 'user')?.content || '';
    const intent = detectIntent(lastUserMessage);

    // Load user progress if userId is provided
    let userProgress: UserProgress | null = null;
    if (userId) {
      userProgress = await getOrCreateProgress(userId);
    }

    // === Tool Execution ===
    if (intent.tool) {
      let toolData: any;
      let message = '';

      switch (intent.tool) {
        case 'generate_practice_questions': {
          // Bias toward weak domains if we have progress
          const domains = userProgress?.weak_domains?.length
            ? [...userProgress.weak_domains, 'life_types', 'policy_provisions']
            : ['life_types', 'policy_provisions', 'health_insurance', 'riders', 'regulations'];

          toolData = generatePracticeQuestions(domains.slice(0, 5), 6, 'mixed', 'Wisconsin');
          message = `Here's a diagnostic quiz tailored to your current weak areas.`;
          break;
        }

        case 'analyze_readiness': {
          // Use latest quiz from history or sample
          const latestQuiz = userProgress?.quiz_history?.[userProgress.quiz_history.length - 1];
          const quizResults = latestQuiz
            ? { overall_score: latestQuiz.score, domain_scores: latestQuiz.domain_scores }
            : { overall_score: 58, domain_scores: { riders: 35, health_insurance: 42, policy_provisions: 48 } };

          toolData = analyzeReadiness(quizResults, userProgress?.exam_date, userProgress?.current_readiness);
          message = 'Here’s your latest readiness analysis.';
          break;
        }

        case 'create_study_schedule': {
          toolData = createStudySchedule(
            userProgress?.exam_date || '2026-07-30',
            userProgress?.current_readiness || 50,
            userProgress?.weak_domains || ['riders', 'health_insurance'],
            50
          );
          message = 'Personalized study schedule created based on your progress.';
          break;
        }

        case 'get_insurance_regulation': {
          toolData = getInsuranceRegulation(intent.params?.state ?? '', intent.params?.topic ?? '');
          message = `Wisconsin regulation for ${intent.params?.topic}.`;
          break;
        }
      }

      return NextResponse.json({
        type: 'tool_result',
        tool: intent.tool,
        data: toolData,
        message,
        current_progress: userProgress
          ? {
              readiness: userProgress.current_readiness,
              weak_domains: userProgress.weak_domains,
              streak: userProgress.study_streak,
            }
          : null,
      });
    }

    // === Claude Fallback ===
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        type: 'claude_fallback',
        message: "I'm ARIA, your insurance exam coach! I can help with practice questions, study plans, and readiness analysis. Try asking me for a quiz or to analyze your readiness.",
      });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = `You are ARIA, an expert AI coach for U.S. insurance licensing exams, specializing in Wisconsin Life & Health insurance. You help students prepare for their state licensing exam with practice questions, study strategies, concept explanations, and encouragement. Keep responses concise and focused on exam prep. ${userProgress ? `The student's current readiness is ${userProgress.current_readiness}% and their weak areas are: ${userProgress.weak_domains?.join(', ')}.` : ''}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m: Message) => ({ role: m.role, content: m.content })),
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ type: 'claude_response', message: reply });
  } catch (error: any) {
    console.error('ARIA API Error:', error);
    return NextResponse.json(
      { type: 'error', message: error.message },
      { status: 500 }
    );
  }
}
