-- ═══════════════════════════════════════════════
-- DSA Studio — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════

-- Topics (e.g., Graphs, DP, Arrays)
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text default 'folder',
  position int default 0,
  created_at timestamptz default now()
);

-- Subtopics (e.g., Bridges, Shortest Path, BFS/DFS)
create table if not exists subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  name text not null,
  position int default 0,
  created_at timestamptz default now()
);

-- Problems
create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  subtopic_id uuid references subtopics(id) on delete cascade not null,
  name text not null,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')) default 'Medium',
  status text check (status in ('todo', 'inProgress', 'revision', 'completed')) default 'todo',
  description text default '',
  in_depth_explanation text default '',
  leetcode_url text default '',
  gfg_url text default '',
  notes text default '',
  bookmarked boolean default false,
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Solutions (brute, better, optimal per problem)
create table if not exists solutions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references problems(id) on delete cascade not null,
  approach_type text check (approach_type in ('Brute Force', 'Better', 'Optimal')) not null,
  intuition text default '',
  in_depth_intuition text default '',
  algorithm text default '',
  code text default '',
  language text default 'java',
  time_complexity text default '',
  space_complexity text default '',
  visualization_html text default '',
  position int default 0,
  created_at timestamptz default now()
);

-- Hints per solution
create table if not exists hints (
  id uuid primary key default gen_random_uuid(),
  solution_id uuid references solutions(id) on delete cascade not null,
  text text not null,
  position int default 0
);

-- Enable Row Level Security
alter table topics enable row level security;
alter table subtopics enable row level security;
alter table problems enable row level security;
alter table solutions enable row level security;
alter table hints enable row level security;

-- Policies: Allow all operations for anonymous users (for simplicity)
-- In production, replace with auth-based policies
create policy "Allow all on topics" on topics for all using (true) with check (true);
create policy "Allow all on subtopics" on subtopics for all using (true) with check (true);
create policy "Allow all on problems" on problems for all using (true) with check (true);
create policy "Allow all on solutions" on solutions for all using (true) with check (true);
create policy "Allow all on hints" on hints for all using (true) with check (true);

-- Auto-update updated_at on problems
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger problems_updated_at
  before update on problems
  for each row execute function update_updated_at();

-- Indexes for performance
create index idx_subtopics_topic on subtopics(topic_id);
create index idx_problems_subtopic on problems(subtopic_id);
create index idx_solutions_problem on solutions(problem_id);
create index idx_hints_solution on hints(solution_id);
