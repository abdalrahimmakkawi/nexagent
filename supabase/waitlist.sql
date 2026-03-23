-- Waitlist table
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  business_name text,
  business_type text,
  message text,
  source text default 'website',
  position integer,
  status text default 'waiting',
  created_at timestamp with time zone default now()
);

-- Auto-assign position number on insert
create or replace function set_waitlist_position()
returns trigger as $$
begin
  NEW.position := (select coalesce(max(position), 0) + 1 from waitlist);
  return NEW;
end;
$$ language plpgsql;

create trigger waitlist_position_trigger
  before insert on waitlist
  for each row execute function set_waitlist_position();

-- Enable RLS
alter table waitlist enable row level security;

-- Anyone can insert (join waitlist)
create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

-- Only service role can read (admin only)
create policy "Service role reads waitlist"
  on waitlist for select
  using (auth.role() = 'service_role');
