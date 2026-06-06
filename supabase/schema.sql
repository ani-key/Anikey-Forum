-- ============================================================
-- Anikey-Forum 数据库结构
-- 在 Supabase 控制台 → SQL Editor 里整段粘贴运行即可。
-- 包含：profiles / ratings / comments 三张表、行级权限(RLS)、
--       以及注册后自动创建 profile 的触发器。
-- ============================================================

-- ---------- 1. 用户资料 ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- 2. 评分（每人每番唯一） ----------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id integer not null,                 -- Bangumi 条目 id
  score integer not null check (score between 1 and 10),
  updated_at timestamptz not null default now(),
  unique (user_id, subject_id)
);
create index if not exists ratings_subject_idx on public.ratings (subject_id);

-- ---------- 3. 评论（支持一级回复） ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id integer not null,
  parent_id uuid references public.comments (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_subject_idx on public.comments (subject_id);

-- ============================================================
-- 行级权限 (RLS)：读公开，写仅限本人
-- ============================================================
alter table public.profiles enable row level security;
alter table public.ratings  enable row level security;
alter table public.comments enable row level security;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ratings
drop policy if exists "ratings_select" on public.ratings;
create policy "ratings_select" on public.ratings
  for select using (true);
drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own" on public.ratings
  for insert with check (auth.uid() = user_id);
drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own" on public.ratings
  for update using (auth.uid() = user_id);
drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own" on public.ratings
  for delete using (auth.uid() = user_id);

-- comments
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (true);
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 注册后自动创建 profile（用 user_metadata.username）
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 实时更新：为 comments / ratings 开启 Supabase Realtime。
-- 开启后，别人发的评论/评分会通过 WebSocket 推送到正在浏览该番剧的用户，
-- 页面自动刷新、无需手动刷新。下面写成幂等，重复运行不会报错。
-- ============================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
    ) then
      execute 'alter publication supabase_realtime add table public.comments';
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ratings'
    ) then
      execute 'alter publication supabase_realtime add table public.ratings';
    end if;
  end if;
end $$;
