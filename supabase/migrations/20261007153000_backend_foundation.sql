-- OGP backend foundation: profiles, roles, GitHub traffic archive,
-- and admin-only aggregate queries.

create extension if not exists pgcrypto;

create table if not exists public.app_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'viewer'
    check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_profiles enable row level security;
revoke all on table public.app_profiles from anon, authenticated;
grant select on public.app_profiles to authenticated;
grant update on public.app_profiles to authenticated;
create index if not exists app_profiles_role_idx on public.app_profiles(role);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_profiles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "users can read their own profile"
on public.app_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "admins can read all profiles"
on public.app_profiles for select to authenticated
using ((select public.is_admin()));

create policy "admins can update profiles"
on public.app_profiles for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_profiles(user_id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (user_id) do update
    set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.bootstrap_admin_by_email(target_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare target_user uuid;
begin
  select id into target_user from auth.users where lower(email) = lower(trim(target_email)) limit 1;
  if target_user is null then raise exception 'No Auth user exists for this email'; end if;
  insert into public.app_profiles(user_id, email, role)
  values (target_user, target_email, 'admin')
  on conflict (user_id) do update set email = excluded.email, role = 'admin', updated_at = now();
  return target_user;
end;
$$;

revoke all on function public.bootstrap_admin_by_email(text) from public, anon, authenticated;

create table if not exists public.github_traffic_daily (
  traffic_date date primary key,
  views_total bigint not null default 0,
  views_unique bigint not null default 0,
  clones_total bigint not null default 0,
  clones_unique bigint not null default 0,
  referrers jsonb not null default '[]'::jsonb,
  popular_paths jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  schema_version text not null default '1'
);
alter table public.github_traffic_daily enable row level security;
revoke all on table public.github_traffic_daily from anon, authenticated;
grant select on public.github_traffic_daily to authenticated;
create policy "admins can read GitHub traffic archive"
on public.github_traffic_daily for select to authenticated
using ((select public.is_admin()));
create index if not exists github_traffic_daily_date_idx on public.github_traffic_daily(traffic_date desc);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on table public.admin_audit_log from anon, authenticated;
grant select, insert on public.admin_audit_log to authenticated;
create policy "admins can read admin audit log"
on public.admin_audit_log for select to authenticated
using ((select public.is_admin()));
create policy "admins can write admin audit log"
on public.admin_audit_log for insert to authenticated
with check ((select public.is_admin()) and actor_user_id = (select auth.uid()));

create or replace function public.admin_analytics_summary(from_ts timestamptz default now() - interval '30 days', to_ts timestamptz default now())
returns table (page_views bigint, unique_visitors bigint, sessions bigint, engagements bigint, cta_clicks bigint, conversions bigint)
language sql stable security definer set search_path = public
as $$
  select
    count(*) filter (where event_name = 'page_view'),
    count(distinct visitor_id) filter (where visitor_id is not null),
    count(distinct session_id) filter (where session_id is not null),
    count(*) filter (where event_name = 'engagement'),
    count(*) filter (where event_name = 'cta_click'),
    count(*) filter (where event_name = 'conversion')
  from public.analytics_events
  where occurred_at >= from_ts and occurred_at < to_ts and public.is_admin();
$$;
revoke all on function public.admin_analytics_summary(timestamptz, timestamptz) from public;
grant execute on function public.admin_analytics_summary(timestamptz, timestamptz) to authenticated;

create or replace function public.admin_analytics_timeseries(from_ts timestamptz default now() - interval '30 days', to_ts timestamptz default now())
returns table (bucket date, page_views bigint, unique_visitors bigint, sessions bigint, conversions bigint)
language sql stable security definer set search_path = public
as $$
  select
    (occurred_at at time zone 'UTC')::date,
    count(*) filter (where event_name = 'page_view'),
    count(distinct visitor_id) filter (where visitor_id is not null),
    count(distinct session_id) filter (where session_id is not null),
    count(*) filter (where event_name = 'conversion')
  from public.analytics_events
  where occurred_at >= from_ts and occurred_at < to_ts and public.is_admin()
  group by 1 order by 1;
$$;
revoke all on function public.admin_analytics_timeseries(timestamptz, timestamptz) from public;
grant execute on function public.admin_analytics_timeseries(timestamptz, timestamptz) to authenticated;

grant select on public.analytics_events to authenticated;
create policy "admins can read analytics events"
on public.analytics_events for select to authenticated
using ((select public.is_admin()));
