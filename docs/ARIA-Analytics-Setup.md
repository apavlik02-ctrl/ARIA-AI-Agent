# ARIA Analytics Setup

## Recommended Events to Track

### Core Product Events
| Event Name                    | Properties                                      | When to Track                  |
|-------------------------------|--------------------------------------------------|--------------------------------|
| `user_signed_up`              | `source`, `plan`                                 | After successful signup        |
| `onboarding_completed`        | `exam_type`, `state`, `readiness`                | After finishing onboarding     |
| `quiz_started`                | `quiz_type`, `domain`                            | When user starts a quiz        |
| `quiz_completed`              | `score`, `domain_scores`, `time_spent`           | When quiz is finished          |
| `study_plan_generated`        | `exam_date`, `weak_domains`                      | When a study plan is created   |
| `readiness_updated`           | `old_readiness`, `new_readiness`, `change`       | After quiz or manual update    |
| `notification_clicked`        | `notification_type`, `notification_id`           | When user clicks a notification|
| `subscription_started`        | `plan`, `amount`, `interval`                     | When user subscribes           |
| `subscription_cancelled`      | `plan`, `reason` (if collected)                  | When user cancels              |

### Engagement Events
- `daily_active_user`
- `streak_milestone_reached` (7 days, 14 days, etc.)
- `feature_used` (with feature name)

---

## Implementation Options

### Option 1: Vercel Analytics + Custom Events (Simplest)
Vercel Analytics supports custom events.

```ts
import { track } from '@vercel/analytics';

track('quiz_completed', {
  score: 78,
  exam_type: 'Life',
});
```

### Option 2: PostHog (Recommended for Product Analytics)
Excellent free tier and very powerful.

```ts
posthog.capture('quiz_completed', {
  score: 78,
  weak_domains: ['riders', 'health_insurance'],
});
```

### Option 3: Mixpanel / Amplitude
Good if you need advanced funnels and retention analysis.

---

## Dashboard Metrics to Build

### North Star Metric
- **% of users who improve readiness by ≥20% within 14 days**

### Key Metrics
- Weekly Active Users (WAU)
- Trial → Paid Conversion Rate
- Average Readiness Improvement
- Retention (D1, D7, D30)
- Most common weak domains
- Quiz completion rate

---

## Quick Start Recommendation

1. Start with **Vercel Analytics** (zero setup)
2. Add **PostHog** when you need more powerful product analytics
3. Track the core events listed above first

Would you like me to create a small `analytics.ts` helper file with the key events pre-defined?