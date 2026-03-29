-- Agent types table
create table if not exists agent_types (
  id text primary key,
  name text not null,
  description text,
  icon text,
  is_available boolean default true,
  tier text default 'team' 
    check (tier in ('starter', 'team', 'squad', 'enterprise'))
);

-- Insert the 8 agent types
insert into agent_types (id, name, description, icon, tier) 
values
  ('router', 'Router Agent', 'Traffic controller — reads every message and assigns to right specialist', '🔀', 'team'),
  ('support', 'Support Agent', 'Handles complaints, returns, and order issues with empathy', '🛡️', 'starter'),
  ('sales', 'Sales Agent', 'Captures leads, upsells, and drives revenue', '💰', 'team'),
  ('faq', 'FAQ Agent', 'Instant answers to common questions with zero latency', '⚡', 'team'),
  ('escalation', 'Escalation Agent', 'Handles angry customers and routes to humans', '🚨', 'team'),
  ('followup', 'Follow-up Agent', 'Re-engages cold leads after 24 hours of silence', '🔄', 'squad'),
  ('analytics', 'Analytics Agent', 'Weekly conversation summaries and insights', '📊', 'squad'),
  ('onboarding', 'Onboarding Agent', 'Welcomes new customers and guides first steps', '👋', 'squad')
on conflict (id) do nothing;

-- Agent teams table (which agents a client has)
create table if not exists agent_teams (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  plan text not null check (plan in ('starter', 'team', 'squad', 'enterprise')),
  active_agents text[] default '{"support"}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Routing decisions log
create table if not exists routing_decisions (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id),
  message_content text,
  assigned_to text,
  sentiment numeric(4,3),
  intent text,
  urgency text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table agent_types enable row level security;
alter table agent_teams enable row level security;
alter table routing_decisions enable row level security;

create policy "Anyone can read agent types"
  on agent_types for select using (true);

create policy "Service role agent teams"
  on agent_teams for all
  using (auth.role() = 'service_role');

create policy "Service role routing decisions"
  on routing_decisions for all
  using (auth.role() = 'service_role');
