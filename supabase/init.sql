-- ─────────────────────────────────────────────────────────────────────────────
-- Fixture — Supabase DB bootstrap
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Profiles ──────────────────────────────────────────────────────────────
-- One row per auth user. id mirrors auth.users.id (same UUID).

create table if not exists public.profiles (
  id             uuid        primary key references auth.users(id) on delete cascade,
  username       text        unique not null,
  display_name   text        not null,
  bio            text,
  avatar_url     text,
  favorite_teams text[]      not null default '{}',
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);


-- ── 2. Reviews ───────────────────────────────────────────────────────────────
-- user_id → profiles.id so Supabase can auto-join in .select('*, profiles(*)')

create table if not exists public.reviews (
  id         uuid        primary key default gen_random_uuid(),
  game_id    bigint      not null,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  rating     int         not null check (rating between 1 and 5),
  text       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(game_id, user_id)
);

create index if not exists reviews_game_id_idx on public.reviews(game_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

alter table public.reviews enable row level security;
create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete" on public.reviews for delete using (auth.uid() = user_id);


-- ── 3. Follows ───────────────────────────────────────────────────────────────

create table if not exists public.follows (
  follower_id  uuid        not null references public.profiles(id) on delete cascade,
  following_id uuid        not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);


-- ── 4. Review likes ──────────────────────────────────────────────────────────

create table if not exists public.review_likes (
  review_id  uuid        not null references public.reviews(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_likes enable row level security;
create policy "review_likes_select" on public.review_likes for select using (true);
create policy "review_likes_insert" on public.review_likes for insert with check (auth.uid() = user_id);
create policy "review_likes_delete" on public.review_likes for delete using (auth.uid() = user_id);


-- ── 6. Auto-create profile on signup ─────────────────────────────────────────
-- Username defaults to the part before @ in the email address.
-- Appends _2, _3, … if the base username is already taken.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  base_username text;
  candidate     text;
  suffix        int := 2;
begin
  base_username := split_part(new.email, '@', 1);
  candidate     := base_username;

  -- Find a free username
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base_username || '_' || suffix;
    suffix    := suffix + 1;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'display_name', candidate)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── 7. Backfill profiles for any existing auth users ─────────────────────────

insert into public.profiles (id, username, display_name)
select id, split_part(email, '@', 1), split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;
