-- OGP analytics events
-- Privacy-by-design: no raw IP, MAC, or hardware fingerprint columns.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  event_name text not null,
  path text not null,
  referrer text,
  campaign_source text,
  campaign_medium text,
  campaign_name text,
  campaign_content text,
  campaign_term text,
  visitor_id uuid,
  session_id uuid,
  user_id text,
  country text,
  region text,
  device_class text,
  browser_family text,
  os_family text,
  viewport_class text,
  language text,
  timezone text,
  consent_analytics boolean not null default false,
  consent_marketing boolean not null default false,
  schema_version text not null default '1'
);

alter table public.analytics_events enable row level security;

-- Events are inserted only by the Edge Function using the server-side secret key.
-- Do not grant direct client access to this table.
revoke all on table public.analytics_events from anon, authenticated;

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name, occurred_at desc);

create index if not exists analytics_events_visitor_id_idx
  on public.analytics_events (visitor_id, occurred_at desc)
  where visitor_id is not null;
