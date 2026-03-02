-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

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

-- Enable RLS (Optional: For this demo, we allow public read/write to mimic the local experience)
-- In a production app, you would lock down write access.
alter table public.articles enable row level security;
alter table public.comments enable row level security;

-- Policies for Articles
create policy "Public articles are viewable by everyone"
  on public.articles for select
  using ( true );

create policy "Public articles are editable by anyone (Demo Mode)"
  on public.articles for insert
  with check ( true );

create policy "Public articles are updateable by anyone (Demo Mode)"
  on public.articles for update
  using ( true );

create policy "Public articles are deletable by anyone (Demo Mode)"
  on public.articles for delete
  using ( true );

-- Policies for Comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using ( true );

create policy "Comments are insertable by everyone"
  on public.comments for insert
  with check ( true );

create policy "Comments are deletable by everyone"
  on public.comments for delete
  using ( true );

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.comments;
