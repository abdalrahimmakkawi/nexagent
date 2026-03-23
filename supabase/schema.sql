-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  business_name text,
  industry text,
  plan text default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Agents table
create table agents (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  store_id text not null,
  system_prompt text,
  status text default 'building',
  conversations_count integer default 0,
  leads_captured integer default 0,
  created_at timestamp with time zone default now()
);

-- Leads table
create table leads (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  value text not null,
  field_type text default 'email',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table clients enable row level security;
alter table agents enable row level security;
alter table leads enable row level security;

-- Policies: clients can only see their own data
create policy "Clients see own data" on clients
  for select using (auth.uid()::text = id::text);

create policy "Agents visible to owner" on agents
  for select using (
    client_id in (
      select id from clients where auth.uid()::text = id::text
    )
  );
