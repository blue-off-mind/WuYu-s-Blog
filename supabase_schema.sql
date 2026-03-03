-- ARTICLES TABLE
create table if not exists public.articles (
  id text primary key,
  title text not null,
  author text not null,
  category text not null,
  mood text not null,
  "publishedAt" timestamp with time zone not null,
  "imageUrl" text not null,
  "editorNote" text,
  "bestContext" text,
  "pullQuote" text,
  content text,
  "isFeatured" boolean default false,
  likes integer default 0
);

-- COMMENTS TABLE
create table if not exists public.comments (
  id text primary key,
  "articleId" text not null references public.articles(id) on delete cascade,
  author text not null,
  content text not null,
  "createdAt" timestamp with time zone not null
);

-- ADMIN USERS TABLE
-- Add authenticated user ids here to grant CMS write/delete permissions.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now()
);

-- Admin check helper
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Public like increment helper.
-- Keeps article edit/delete locked to admins while allowing like actions.
drop function if exists public.increment_article_likes(text, integer);
create or replace function public.increment_article_likes(
  p_article_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.articles
  set likes = coalesce(likes, 0) + 1
  where id = p_article_id;
$$;

grant execute on function public.increment_article_likes(text) to anon, authenticated, service_role;

-- Enable RLS
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.admin_users enable row level security;

-- Reset policies for idempotent reruns
drop policy if exists "Public articles are viewable by everyone" on public.articles;
drop policy if exists "Admins can insert articles" on public.articles;
drop policy if exists "Admins can update articles" on public.articles;
drop policy if exists "Admins can delete articles" on public.articles;
drop policy if exists "Comments are viewable by everyone" on public.comments;
drop policy if exists "Comments are insertable by everyone" on public.comments;
drop policy if exists "Admins can delete comments" on public.comments;
drop policy if exists "Admins can view admin list" on public.admin_users;

-- Articles policies
create policy "Public articles are viewable by everyone"
  on public.articles for select
  using (true);

create policy "Admins can insert articles"
  on public.articles for insert
  with check (public.is_admin());

create policy "Admins can update articles"
  on public.articles for update
  using (public.is_admin());

create policy "Admins can delete articles"
  on public.articles for delete
  using (public.is_admin());

-- Comments policies
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Comments are insertable by everyone"
  on public.comments for insert
  with check (true);

create policy "Admins can delete comments"
  on public.comments for delete
  using (public.is_admin());

-- Admin user list visibility for admins
create policy "Admins can view admin list"
  on public.admin_users for select
  using (public.is_admin());

-- Enable Realtime publication and add tables idempotently
do $$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'articles'
  ) then
    alter publication supabase_realtime add table public.articles;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;
end $$;
