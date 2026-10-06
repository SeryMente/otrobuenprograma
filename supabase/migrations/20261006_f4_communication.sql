-- F4 · Instrumento de comunicacion
-- Supabase: persistencia del buzon + chat Realtime + Glosa compartida.
-- Requiere habilitar Anonymous Sign-Ins en Auth.
-- El sitio usa la publishable/anon key en el navegador; service_role NO se publica.

create extension if not exists pgcrypto;

create or replace function public.is_pulso_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select auth.jwt()->'app_metadata'->>'role') = 'operator', false);
$$;

revoke all on function public.is_pulso_operator() from public;
grant execute on function public.is_pulso_operator() to authenticated;

create table if not exists public.pulso_chat_messages (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('visitor','operator')),
  body text not null check (char_length(body) between 1 and 1200),
  mode text not null default 'async' check (mode in ('live','async')),
  client_id text not null,
  created_at timestamptz not null default now(),
  unique (visitor_id, client_id)
);

create index if not exists pulso_chat_messages_visitor_created_idx
  on public.pulso_chat_messages (visitor_id, created_at);

alter table public.pulso_chat_messages enable row level security;

revoke all on table public.pulso_chat_messages from anon, authenticated;
grant select, insert on table public.pulso_chat_messages to authenticated;

drop policy if exists pulso_chat_select on public.pulso_chat_messages;
create policy pulso_chat_select
  on public.pulso_chat_messages
  for select
  to authenticated
  using (
    visitor_id = (select auth.uid())
    or (select public.is_pulso_operator())
  );

drop policy if exists pulso_chat_insert on public.pulso_chat_messages;
create policy pulso_chat_insert
  on public.pulso_chat_messages
  for insert
  to authenticated
  with check (
    (
      sender_role = 'visitor'
      and visitor_id = (select auth.uid())
      and (select (auth.jwt()->>'is_anonymous')::boolean) is true
    )
    or (
      sender_role = 'operator'
      and (select public.is_pulso_operator())
    )
  );

create table if not exists public.glosas_compartidas (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  anchor text not null check (char_length(anchor) between 1 and 180),
  text text not null check (char_length(text) between 1 and 1200),
  author text not null default 'Anonimo' check (char_length(author) between 1 and 40),
  author_id uuid not null references auth.users(id) on delete cascade,
  quote text not null default '',
  approved boolean not null default true,
  created_at timestamptz not null default now(),
  unique (author_id, client_id)
);

create index if not exists glosas_compartidas_anchor_created_idx
  on public.glosas_compartidas (anchor, created_at);

alter table public.glosas_compartidas enable row level security;

revoke all on table public.glosas_compartidas from anon, authenticated;
grant select, insert on table public.glosas_compartidas to authenticated;

drop policy if exists glosas_select on public.glosas_compartidas;
create policy glosas_select
  on public.glosas_compartidas
  for select
  to authenticated
  using (
    approved = true
    or (select public.is_pulso_operator())
  );

drop policy if exists glosas_insert on public.glosas_compartidas;
create policy glosas_insert
  on public.glosas_compartidas
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is true
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pulso_chat_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.pulso_chat_messages';
  end if;
end $$;
