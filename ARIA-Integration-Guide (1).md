# ARIA Integration Guide into Existing PassPro Codebase

## Overview

This guide helps you integrate ARIA components into your existing PassPro Next.js application with minimal friction.

---

## 1. Folder Structure Recommendation

Create a dedicated folder for ARIA:

```bash
components/ARIA/
├── ui/                    # Reusable UI components
│   ├── ReadinessWidget.tsx
│   ├── QuizRenderer.tsx
│   ├── StudyScheduleRenderer.tsx
│   └── InAppNotificationCenter.tsx
├── flows/                 # Multi-step flows
│   └── OnboardingFlow.tsx
├── modals/                # Modal components
│   └── ARIAModal.tsx
├── dashboard/             # Dashboard-related
│   └── ARIADashboard.tsx
├── hooks/                 # Custom hooks
│   ├── useSupabaseRealtime.ts
│   └── useSocket-with-reconnection.ts
└── lib/                   # Shared logic (if not in root lib/)
    ├── aria-tools.ts
    └── progress.ts
```

---

## 2. Adding the Core Libraries

Copy these into your project:

```bash
cp artifacts/passpro-api/lib/aria-tools.ts lib/aria-tools.ts
cp artifacts/passpro-api/lib/progress.ts lib/progress.ts
```

Then import them like this:

```ts
import { generatePracticeQuestions, analyzeReadiness } from '@/lib/aria-tools';
import { calculateNewReadiness } from '@/lib/progress';
```

---

## 3. API Route Integration

Add the ARIA API route:

```bash
mkdir -p app/api/aria
cp artifacts/passpro-api/aria/route-with-progress.ts app/api/aria/route.ts
```

Update environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...   # Optional (for Claude fallback)
```

---

## 4. Using Components in PassPro

### Example: Adding Readiness Widget to Dashboard

```tsx
// app/dashboard/page.tsx
import ReadinessWidget from '@/components/ARIA/ui/ReadinessWidget';
import { useSupabaseRealtime } from '@/components/ARIA/hooks/useSupabaseRealtime';

export default function DashboardPage({ user }) {
  const { notifications } = useSupabaseRealtime({ userId: user.id });

  return (
    <div>
      <ReadinessWidget 
        progress={userProgress}
        onStartQuiz={() => openARIAModal()}
      />
      
      {/* Other dashboard content */}
    </div>
  );
}
```

### Example: Adding ARIA Modal

```tsx
'use client';

import { useState } from 'react';
import ARIAModal from '@/components/ARIA/modals/ARIAModal';

export default function SomePage({ user }) {
  const [showARIA, setShowARIA] = useState(false);

  return (
    <>
      <button onClick={() => setShowARIA(true)}>
        Talk to ARIA
      </button>

      <ARIAModal 
        isOpen={showARIA} 
        onClose={() => setShowARIA(false)} 
        user={user}
      />
    </>
  );
}
```

---

## 5. Authentication Integration (Clerk)

Since PassPro uses Clerk:

```tsx
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <RealTimeNotificationCenter userId={user.id} />
  );
}
```

---

## 6. Database Integration

Run `ARIA-Database-Schema.sql` in your Supabase project.

Then use the `useSupabaseRealtime` hook for live data.

---

## 7. Quick Wins (Recommended Order)

1. Add `ReadinessWidget` to your existing dashboard
2. Add `ARIAModal` triggered from sidebar or header
3. Connect `useSupabaseRealtime` for live notifications
4. Add OnboardingFlow for new users
5. Wire up the main ARIA chat experience

---

## Need Help With a Specific Part?

Tell me which component or page you want to integrate first, and I can give you the exact code changes for your current structure.