# ARIA Progress Tracking - Supabase Setup

## 1. Create the Table in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
create table if not exists aria_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_date date,
  current_readiness integer default 45,
  weak_domains text[] default array['riders', 'health_insurance'],
  last_quiz_score integer,
  quiz_history jsonb default '[]'::jsonb,
  study_streak integer default 0,
  last_study_date date,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table aria_progress enable row level security;

-- Users can only see and modify their own progress
create policy "Users can view own progress"
  on aria_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on aria_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on aria_progress for update
  using (auth.uid() = user_id);
```

## 2. Recommended Indexes

```sql
create index if not exists idx_aria_progress_user_id on aria_progress(user_id);
create index if not exists idx_aria_progress_readiness on aria_progress(current_readiness);
```

## 3. How to Use in Your App

### In your API route (`app/api/aria/route.ts`):

```ts
import { createClient } from '@supabase/supabase-js';
import { getDefaultProgress, calculateNewReadiness, updateWeakDomains } from '@/lib/progress';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

// Example: Load or create progress
async function getUserProgress(userId: string) {
  const { data } = await supabase
    .from('aria_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) return data;

  // Create default
  const defaultProgress = getDefaultProgress(userId);
  await supabase.from('aria_progress').insert(defaultProgress);
  return defaultProgress;
}
```

This gives you persistent memory for ARIA across sessions.
