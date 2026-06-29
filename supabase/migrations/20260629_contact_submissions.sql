create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Allow anon inserts (form is public)
alter table contact_submissions enable row level security;
create policy "Anyone can submit contact form" on contact_submissions
  for insert with check (true);
