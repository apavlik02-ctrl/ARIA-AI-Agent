# ARIA — Complete Integration Guide for PassPro

ARIA is a powerful, tool-augmented AI coach for Wisconsin Life & Health Insurance exam preparation, deeply integrated with the PassPro platform.

## Architecture Overview

```
Frontend (React/Next.js)
├── ARIADashboard.tsx          → Main progress dashboard
├── ARIAModal.tsx              → Modal wrapper for chat
├── ReadinessWidget.tsx        → Reusable progress card
├── QuizRenderer.tsx           → Interactive quiz component
├── StudyScheduleRenderer.tsx  → Study plan display
└── aria-agent-with-quiz.jsx   → Core ARIA chat experience

Backend (Next.js API Routes)
└── app/api/aria/route.ts      → Smart router (tools + Claude + progress)

Shared Libraries
├── lib/aria-tools.ts          → Core tools (quiz, readiness, schedule, regulations)
└── lib/progress.ts            → Progress tracking + streak logic

Data Layer
└── Supabase (aria_progress table)
```

## Quick Start

### 1. Database Setup

Run the SQL from `SUPABASE_PROGRESS_SETUP.md` in your Supabase project.

### 2. Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Install Components

Copy these files into your project:

```bash
# Core
cp artifacts/passpro-api/aria/route-with-progress.ts app/api/aria/route.ts
cp artifacts/passpro-api/lib/aria-tools.ts lib/aria-tools.ts
cp artifacts/passpro-api/lib/progress.ts lib/progress.ts

# Components
cp artifacts/ReadinessWidget.tsx components/ARIA/
cp artifacts/QuizRenderer.tsx components/ARIA/
cp artifacts/StudyScheduleRenderer.tsx components/ARIA/
cp artifacts/ARIAModal.tsx components/ARIA/
cp artifacts/ARIADashboard.tsx components/ARIA/
cp artifacts/aria-agent-with-quiz.jsx components/ARIA/
cp artifacts/AdminQuestionManager.tsx components/ARIA/
```

### 4. Basic Usage

```tsx
// In your layout or page
import ARIAModal from "@/components/ARIA/ARIAModal";
import ReadinessWidget from "@/components/ARIA/ReadinessWidget";

const [showARIA, setShowARIA] = useState(false);

// Dashboard example
<ReadinessWidget 
  progress={userProgress}
  onStartQuiz={() => setShowARIA(true)}
/>

<ARIAModal 
  isOpen={showARIA} 
  onClose={() => setShowARIA(false)} 
  user={user}
/>
```

## Key Features

### Persistent Progress
- Readiness percentage
- Weak domain tracking
- Study streaks
- Quiz history

### Smart Tool Orchestration
- Generates quizzes focused on weak areas
- Creates personalized study schedules
- Provides Wisconsin-specific regulations
- Analyzes readiness with context

### Beautiful UI Components
- Interactive quizzes with auto-scoring
- Clean study schedule views
- Dashboard widgets
- Admin question manager

## File Reference

| File | Purpose | Key Props / Usage |
|------|---------|-------------------|
| `ReadinessWidget.tsx` | Progress card | `progress`, `onStartQuiz`, `onViewSchedule` |
| `QuizRenderer.tsx` | Interactive quiz | `questions`, `onComplete` |
| `StudyScheduleRenderer.tsx` | Study plan | `scheduleData` |
| `ARIAModal.tsx` | Modal chat | `isOpen`, `onClose`, `user`, `initialMode` |
| `ARIADashboard.tsx` | Full dashboard | `userProgress`, callbacks |
| `aria-agent-with-quiz.jsx` | Core chat | `user` |
| `AdminQuestionManager.tsx` | Question admin | `initialQuestions`, `onQuestionsChange` |

## Extending ARIA

### Adding More Questions

Use the `AdminQuestionManager` component or directly edit `lib/aria-tools.ts` → `SAMPLE_QUESTIONS`.

### Adding New Tools

1. Add the tool logic in `lib/aria-tools.ts`
2. Update intent detection in `app/api/aria/route.ts`
3. Handle the new tool type in `aria-agent-with-quiz.jsx`

### Connecting to Real User Data

The current system uses Clerk `user.id`. Make sure your authenticated routes pass the correct `userId`.

## Recommended Next Steps

1. **Integrate the Dashboard** into your main app layout
2. **Connect real user progress** from Supabase in your pages
3. **Expand the question bank** using the Admin tool
4. **Add more tools** (flashcards, concept explanations, etc.)
5. **Style polish** to match your exact PassPro design system

---

**You now have a complete, production-capable AI coaching system for PassPro.**

Built with love for Amanda and future Wisconsin insurance professionals.
