-- Extend clients table with onboarding fields
alter table clients add column if not exists 
  business_url text;
alter table clients add column if not exists 
  business_type text;
alter table clients add column if not exists 
  onboarding_completed boolean default false;
alter table clients add column if not exists 
  agent_approved boolean default false;
alter table clients add column if not exists 
  approved_at timestamp with time zone;
alter table clients add column if not exists 
  widget_installed boolean default false;

-- Extend agents table
alter table agents add column if not exists 
  welcome_message text;
alter table agents add column if not exists 
  quick_prompts jsonb default '[]';
alter table agents add column if not exists 
  lead_field text default 'email';
alter table agents add column if not exists 
  lead_message text;
alter table agents add column if not exists 
  escalation_triggers jsonb default '[]';
alter table agents add column if not exists 
  widget_color text default '#6366f1';
alter table agents add column if not exists 
  widget_position text default 'bottom-right';
alter table agents add column if not exists 
  generation_raw jsonb;
alter table agents add column if not exists 
  approved_by text;

-- Conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  session_id text not null,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  message_count integer default 0,
  resolved boolean default false,
  escalated boolean default false,
  lead_captured boolean default false,
  source text default 'widget'
);

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) 
    on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  provider text default 'deepseek',
  latency_ms integer,
  created_at timestamp with time zone default now()
);

-- Onboarding submissions table
create table if not exists onboarding_submissions (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  business_name text not null,
  business_url text,
  business_type text not null,
  industry text,
  products_services text not null,
  price_range text,
  top_faqs text not null,
  tone text default 'friendly',
  competitors text,
  goals text,
  extra_info text,
  submitted_at timestamp with time zone default now()
);

-- RLS policies
alter table conversations enable row level security;
alter table messages enable row level security;
alter table onboarding_submissions enable row level security;

create policy "Clients see own conversations"
  on conversations for select
  using (client_id::text = auth.uid()::text);

create policy "Clients see own messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations 
      where client_id::text = auth.uid()::text
    )
  );

create policy "Clients submit own onboarding"
  on onboarding_submissions for insert
  with check (client_id::text = auth.uid()::text);
