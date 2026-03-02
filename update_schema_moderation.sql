-- Create Moderation Logs Table
create table if not exists public.moderation_logs (
  id text primary key,
  "articleId" text not null references public.articles(id) on delete cascade,
  action text not null,
  "targetContent" text not null,
  moderator text not null,
  "createdAt" timestamp with time zone not null
);

-- Enable RLS
alter table public.moderation_logs enable row level security;

-- Policies
create policy "Moderation logs are viewable by everyone"
  on public.moderation_logs for select
  using ( true );

create policy "Moderation logs are insertable by everyone"
  on public.moderation_logs for insert
  with check ( true );

-- Enable Realtime
alter publication supabase_realtime add table public.moderation_logs;
