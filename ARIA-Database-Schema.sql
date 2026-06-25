-- ============================================
-- ARIA Database Schema (Supabase)
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. User Progress Table
-- ============================================
create table if not exists aria_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_type text,
  state text,
  exam_date date,
  current_readiness integer default 45,
  weak_domains text[] default array[]::text[],
  last_quiz_score integer,
  quiz_history jsonb default '[]'::jsonb,
  study_streak integer default 0,
  last_study_date date,
  study_time_per_day integer default 45,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table aria_progress enable row level security;

-- Policies
create policy "Users can view own progress"
  on aria_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on aria_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on aria_progress for update
  using (auth.uid() = user_id);

-- ============================================
-- 2. Notifications Table
-- ============================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('quiz', 'progress', 'plan', 'offer', 'system')),
  title text not null,
  message text not null,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- ============================================
-- 3. Indexes for Performance
-- ============================================
create index if not exists idx_aria_progress_user_id on aria_progress(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_created_at on notifications(created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id, read) where read = false;

-- ============================================
-- 4. Updated At Trigger (for progress table)
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_aria_progress_updated_at
  before update on aria_progress
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 5. Optional: Questions Table (for future admin-managed questions)
-- ============================================
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  domain text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  question text not null,
  options jsonb not null,
  correct text not null,
  explanation text,
  know_this text,
  state_specific text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table questions enable row level security;

create policy "Questions are publicly readable"
  on questions for select
  using (true);

-- Only admins can modify questions (you can adjust this later)
create policy "Only admins can modify questions"
  on questions for all
  using (false); -- Replace with proper admin check later

-- ============================================
-- 6. Enable Realtime on Notifications Table
-- ============================================
-- This allows Supabase Realtime to work
alter publication supabase_realtime add table notifications;

-- ============================================
-- Notes
-- ============================================
-- After running this SQL:
-- 1. Go to Authentication > Policies to fine-tune RLS if needed
-- 2. Enable Realtime on the `notifications` table in the Supabase dashboard
-- 3. Consider adding a `profiles` table if you need more user metadata
