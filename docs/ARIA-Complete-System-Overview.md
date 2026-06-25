# ARIA — Complete System Overview (Standalone Product)

## Executive Summary

**ARIA** is a production-ready, AI-powered study coach for U.S. insurance licensing exams. It has been built as a **standalone product** (separate from PassPro) with full support for:

- Real-time updates
- Personalized learning
- Multi-channel re-engagement (Email + SMS + Push)
- Clean, premium UX

This document serves as the single source of truth for the entire ARIA system.

---

## Product Positioning

**Name:** ARIA — AI Coach for U.S. Insurance Licensing Exams

**Core Value Proposition:**
> "The smartest way to prepare for your insurance licensing exam. Personalized quizzes, adaptive study plans, and real coaching — not just flashcards."

**Target Users:**
- Individual pre-license candidates (Life, Health, P&C)
- Insurance agencies training new agents
- Pre-licensing schools and training providers

**Initial Scope (Phase 1):**
- Life Insurance + Accident & Health
- All 50 U.S. states (with deeper coverage for high-volume states)

---

## System Architecture

```
Frontend (Next.js + TypeScript + Tailwind)
├── Marketing
│   ├── aria-landing.html
│   └── aria-landing-nextjs.tsx
├── Product UX
│   ├── ARIADashboard.tsx
│   ├── ARIAModal.tsx
│   ├── ReadinessWidget.tsx
│   ├── QuizRenderer.tsx
│   ├── StudyScheduleRenderer.tsx
│   ├── OnboardingFlow.tsx
│   ├── InAppNotificationCenter.tsx
│   └── RealTimeNotificationCenter.tsx
└── Hooks
    ├── useSupabaseRealtime.ts          ← Recommended
    └── useSocket-with-reconnection.ts  ← Alternative

Backend
├── API Routes
│   └── app/api/aria/route.ts (with progress persistence)
├── Libraries
│   ├── lib/aria-tools.ts
│   └── lib/progress.ts
└── Real-time Layer
    ├── Supabase Realtime (Recommended)
    └── Socket.io (Alternative)

Data Layer
└── Supabase
    ├── aria_progress table
    ├── notifications table
    └── Row Level Security (RLS)

Marketing & Growth
├── Email Sequences
│   ├── Onboarding (5 emails)
│   ├── Re-engagement (5 emails)
│   └── Win-back (4 emails)
├── SMS Strategy (Win-back)
└── Push Notification Strategy (Win-back)
```

---

## Core Components

### 1. Marketing
- **Landing Page** (HTML + Next.js versions)
- Clear pricing: Free / Pro ($29/mo or $79/90 days) / Agency ($99/mo)

### 2. Onboarding
- `OnboardingFlow.tsx` — 5-step flow to collect exam info, readiness, and study preferences

### 3. Main Experience
- `ARIADashboard.tsx` — Main progress overview
- `ReadinessWidget.tsx` — Reusable progress card
- `QuizRenderer.tsx` — Interactive quiz experience
- `StudyScheduleRenderer.tsx` — Study plan calendar

### 4. Real-time System (Recommended: Supabase Realtime)
- `useSupabaseRealtime.ts` — Hook with automatic live updates
- `RealTimeNotificationCenter.tsx` — Live-updating notification UI
- Automatic INSERT/UPDATE/DELETE handling

### 5. Re-engagement System
- **Email**: Onboarding + Re-engagement + Win-back sequences
- **SMS**: Win-back strategy with compliant messaging
- **Push Notifications**: In-app + browser notifications

---

## Recommended Tech Stack

| Layer              | Technology                  | Reason |
|--------------------|-----------------------------|--------|
| Frontend           | Next.js 14 + TypeScript + Tailwind | Modern, type-safe, great DX |
| Backend            | Next.js API Routes          | Co-location with frontend |
| Database + Auth    | Supabase                    | Already in use, excellent Realtime |
| Real-time          | **Supabase Realtime**       | Simpler than Socket.io, native DB integration |
| Email              | Customer.io / Klaviyo       | Powerful segmentation & flows |
| SMS                | Twilio or Attentive         | Reliable + compliance tools |
| Hosting            | Vercel                      | Best for Next.js |

---

## File Inventory

### Core Product
- `aria-tools.ts` — Business logic for quizzes, schedules, readiness
- `progress.ts` — Progress tracking helpers
- `route-with-progress.ts` — Main API route
- `useSupabaseRealtime.ts` — Real-time hook (Recommended)
- `useSocket-with-reconnection.ts` — Alternative WebSocket hook

### UI Components
- `ARIADashboard.tsx`
- `ARIAModal.tsx`
- `ReadinessWidget.tsx`
- `QuizRenderer.tsx`
- `StudyScheduleRenderer.tsx`
- `OnboardingFlow.tsx`
- `InAppNotificationCenter.tsx`
- `RealTimeNotificationCenter.tsx`
- `AdminQuestionManager.tsx`

### Marketing
- `aria-landing.html`
- `aria-landing-nextjs.tsx`
- `ARIA-Positioning-Pricing.md`

### Email & Growth
- `ARIA-Email-Onboarding-Sequence.md`
- `ARIA-Reengagement-Sequence.md`
- `ARIA-Winback-Sequence.md`
- `ARIA-Winback-SMS-Strategy.md`
- `ARIA-Winback-Push-Notifications.md`

### Documentation
- `Supabase-Realtime-Alternative.md`
- `ARIA-Complete-System-Overview.md` (this file)

---

## Recommended Implementation Path

### Phase 1: MVP Launch (Individuals)
1. Deploy landing page
2. Implement Supabase Realtime + Notification Center
3. Connect Onboarding Flow
4. Launch with Free + Pro tiers
5. Set up email onboarding sequence

### Phase 2: Engagement & Retention
1. Add Re-engagement + Win-back sequences (Email + SMS + Push)
2. Improve quiz and study plan UX
3. Add basic analytics

### Phase 3: Agency & Scale
1. Build Agency tier + team dashboard
2. Add admin tools
3. Explore white-label / API access

---

## Final Recommendation

**Use Supabase Realtime** as the primary real-time layer.

**Reasons:**
- Already using Supabase
- Dramatically simpler than maintaining Socket.io
- Excellent built-in reconnection and security
- Native database change subscriptions

You now have everything needed to launch ARIA as a high-quality, standalone national product.

---

**This system is ready for production.**

If you need help with deployment, database schema setup, or any specific integration, just let me know. I'm here to help you ship it.