-- Schema creation for PetPlan MVP
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_claim date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  due_at timestamptz,
  repeat_rule text,
  status text not null default 'PENDING' check (status in ('PENDING','DONE','SKIPPED')),
  remind boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.badges (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  name text not null,
  description text not null,
  icon text not null
);

create table if not exists public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default timezone('utc', now()),
  unique(user_id, badge_id)
);

create table if not exists public.friendships (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','BLOCKED')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (requester_id, addressee_id)
);

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('TASK_DONE','STREAK_UP','LEVEL_UP','BADGE')),
  meta jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.tasks enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.friendships enable row level security;
alter table public.activity_log enable row level security;

-- Policies
create policy "Users can manage their profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their pet" on public.pets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Badges readable by all" on public.badges
  for select using (true);

create policy "Users manage their badges" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Friendships visible to involved users" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Friendships manageable by requester" on public.friendships
  for all using (auth.uid() = requester_id) with check (auth.uid() = requester_id);

create policy "Activity visible to owner" on public.activity_log
  for select using (auth.uid() = user_id);

create policy "Activity insert by owner" on public.activity_log
  for insert with check (auth.uid() = user_id);

-- Seed default badges
insert into public.badges (key, name, description, icon)
values
  ('streak_3', '3-Day Streak', 'Complete tasks 3 days in a row', '🔥'),
  ('streak_7', '7-Day Streak', 'Complete tasks 7 days in a row', '💥'),
  ('streak_30', '30-Day Streak', 'Complete tasks 30 days in a row', '🌟'),
  ('lvl_5', 'Level 5', 'Reach level 5', '🛡️'),
  ('lvl_10', 'Level 10', 'Reach level 10', '🏆'),
  ('early_bird', 'Early Bird', 'Complete a task before 9am', '🌅'),
  ('night_owl', 'Night Owl', 'Complete a task after 10pm', '🌙')
on conflict (key) do nothing;
