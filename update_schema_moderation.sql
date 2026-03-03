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

-- Atomic helper: admin-only comment deletion with moderation log
drop function if exists public.delete_comment_with_log(text, text, text);
create or replace function public.delete_comment_with_log(
  p_comment_id text,
  p_log_id text,
  p_moderator text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comment public.comments%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only admins can moderate comments'
      using errcode = '42501';
  end if;

  select *
  into v_comment
  from public.comments
  where id = p_comment_id
  for update;

  if not found then
    raise exception 'Comment % not found', p_comment_id
      using errcode = 'P0002';
  end if;

  insert into public.moderation_logs (
    id,
    "articleId",
    action,
    "targetContent",
    moderator,
    "createdAt"
  )
  values (
    p_log_id,
    v_comment."articleId",
    'DELETE_COMMENT',
    v_comment.content,
    p_moderator,
    now()
  );

  delete from public.comments where id = p_comment_id;
end;
$$;

grant execute on function public.delete_comment_with_log(text, text, text) to authenticated, service_role;

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
