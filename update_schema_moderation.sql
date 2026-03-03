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

-- Reset policies for idempotent reruns
drop policy if exists "Admins can view moderation logs" on public.moderation_logs;
drop policy if exists "Admins can insert moderation logs" on public.moderation_logs;

-- Policies
create policy "Admins can view moderation logs"
  on public.moderation_logs for select
  using (public.is_admin());

create policy "Admins can insert moderation logs"
  on public.moderation_logs for insert
  with check (public.is_admin());

-- Enable Realtime
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'moderation_logs'
  ) then
    alter publication supabase_realtime add table public.moderation_logs;
  end if;
end $$;
