import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock external dependencies before importing the route ─────────────────────

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }));
const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: { setSession: vi.fn() },
  })),
}));

const mockAnthropicCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockAnthropicCreate };
  },
}));

// ── Import route after mocks are wired up ─────────────────────────────────────

import { POST } from '@/app/api/aria/route';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/aria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const defaultProgress = {
  user_id: 'user-1',
  current_readiness: 60,
  weak_domains: ['riders', 'health_insurance'],
  quiz_history: [],
  study_streak: 3,
  last_study_date: '2026-06-28',
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: Supabase returns existing progress
  mockSingle.mockResolvedValue({ data: defaultProgress, error: null });
  // Disable Anthropic key by default so tests don't hit the real API
  delete process.env.ANTHROPIC_API_KEY;
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('POST /api/aria — validation', () => {
  it('returns 400 when messages is missing', async () => {
    const res = await POST(makeRequest({ userId: 'user-1' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/messages/i);
  });

  it('returns 400 when messages is not an array', async () => {
    const res = await POST(makeRequest({ messages: 'hello' }));
    expect(res.status).toBe(400);
  });
});

// ── Intent detection — tool routing ──────────────────────────────────────────

describe('POST /api/aria — intent routing', () => {
  const baseMessages = (text: string) => [{ role: 'user', content: text }];

  it('routes "give me a quiz" to generate_practice_questions', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('Give me a quiz') }));
    const json = await res.json();
    expect(json.type).toBe('tool_result');
    expect(json.tool).toBe('generate_practice_questions');
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('routes "practice question" to generate_practice_questions', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('I want a practice question') }));
    const json = await res.json();
    expect(json.tool).toBe('generate_practice_questions');
  });

  it('routes "how am I doing" to analyze_readiness', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('How am I doing?') }));
    const json = await res.json();
    expect(json.tool).toBe('analyze_readiness');
  });

  it('routes "analyze my readiness" to analyze_readiness', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('Can you analyze my readiness?') }));
    const json = await res.json();
    expect(json.tool).toBe('analyze_readiness');
  });

  it('routes "study plan" to create_study_schedule', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('Create a study plan for me') }));
    const json = await res.json();
    expect(json.tool).toBe('create_study_schedule');
  });

  it('routes "study schedule" to create_study_schedule', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('Show me my study schedule') }));
    const json = await res.json();
    expect(json.tool).toBe('create_study_schedule');
  });

  it('routes a Wisconsin grace period question to get_insurance_regulation', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('What is the Wisconsin grace period?') }));
    const json = await res.json();
    expect(json.tool).toBe('get_insurance_regulation');
    expect(json.data.value).toBe(31);
  });

  it('falls back to the claude_fallback response for unrecognised messages without an API key', async () => {
    const res = await POST(makeRequest({ messages: baseMessages('Tell me about whole life insurance') }));
    const json = await res.json();
    expect(json.type).toBe('claude_fallback');
    expect(json.message).toContain('ARIA');
  });
});

// ── submit_quiz_result action ─────────────────────────────────────────────────

describe('POST /api/aria — submit_quiz_result', () => {
  it('returns a progress_updated response with new readiness', async () => {
    const res = await POST(
      makeRequest({
        action: 'submit_quiz_result',
        userId: 'user-1',
        payload: {
          quizResult: {
            overall_score: 75,
            domain_scores: { life_types: 80, riders: 40 },
          },
        },
      })
    );
    const json = await res.json();
    expect(json.type).toBe('progress_updated');
    expect(typeof json.data.new_readiness).toBe('number');
  });

  it('includes the new readiness in the confirmation message', async () => {
    const res = await POST(
      makeRequest({
        action: 'submit_quiz_result',
        userId: 'user-1',
        payload: {
          quizResult: { overall_score: 80, domain_scores: { life_types: 80 } },
        },
      })
    );
    const json = await res.json();
    expect(json.message).toMatch(/readiness/i);
  });

  it('creates default progress when no existing record is found', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await POST(
      makeRequest({
        action: 'submit_quiz_result',
        userId: 'new-user',
        payload: {
          quizResult: { overall_score: 60, domain_scores: { riders: 60 } },
        },
      })
    );
    const json = await res.json();
    expect(json.type).toBe('progress_updated');
  });
});

// ── Anthropic passthrough ─────────────────────────────────────────────────────

describe('POST /api/aria — Anthropic passthrough', () => {
  it('calls Anthropic and returns a claude_response when API key is set', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Here is some advice about whole life insurance.' }],
    });

    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'Tell me about whole life' }] })
    );
    const json = await res.json();
    expect(json.type).toBe('claude_response');
    expect(json.message).toContain('whole life');
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);

    delete process.env.ANTHROPIC_API_KEY;
  });
});

// ── Progress enrichment in tool responses ─────────────────────────────────────

describe('POST /api/aria — progress context in tool responses', () => {
  it('attaches current_progress when a userId is provided', async () => {
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'Give me a quiz' }], userId: 'user-1' })
    );
    const json = await res.json();
    expect(json.current_progress).not.toBeNull();
    expect(json.current_progress.readiness).toBe(defaultProgress.current_readiness);
    expect(json.current_progress.weak_domains).toEqual(defaultProgress.weak_domains);
  });

  it('omits current_progress when no userId is provided', async () => {
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'Give me a quiz' }] })
    );
    const json = await res.json();
    expect(json.current_progress).toBeNull();
  });
});
