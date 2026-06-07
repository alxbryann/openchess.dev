-- Chess Tournaments — initial schema
-- One table holding tournament metadata + a JSONB `data` document
-- (players + rounds) that mirrors the client-side Tournament shape.

create extension if not exists pgcrypto;

create table public.tournaments (
  id           uuid primary key default gen_random_uuid(),
  share_code   text unique not null,
  owner_id     uuid references auth.users (id) on delete set null,
  name         text not null,
  location     text not null default '',
  date         text not null default '',
  time_control text not null default '',
  system       text not null default 'swiss',
  total_rounds int  not null default 7,
  status       text not null default 'setup',
  data         jsonb not null default '{"players":[],"rounds":[]}'::jsonb,
  created_at   timestamptz not null default now()
);

create index tournaments_owner_id_idx on public.tournaments (owner_id);

alter table public.tournaments enable row level security;

-- Public scoreboard: anyone can read (needed so players can view by code).
create policy "tournaments_select_public"
  on public.tournaments for select
  using (true);

-- Insert: anonymous tournaments (owner_id null) or owned by the signed-in user.
create policy "tournaments_insert_own_or_anon"
  on public.tournaments for insert
  with check (owner_id is null or owner_id = auth.uid());

-- Update: anonymous tournaments are editable by anyone (ephemeral, MVP);
-- owned tournaments only by their owner.
create policy "tournaments_update_own_or_anon"
  on public.tournaments for update
  using (owner_id is null or owner_id = auth.uid())
  with check (owner_id is null or owner_id = auth.uid());

-- Delete: only the owner.
create policy "tournaments_delete_own"
  on public.tournaments for delete
  using (owner_id = auth.uid());

-- Atomic self-registration by share code. SECURITY DEFINER so a player can
-- add themselves even to a tournament owned by someone else.
create or replace function public.join_tournament(
  p_code   text,
  p_name   text,
  p_rating int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t          public.tournaments;
  new_player jsonb;
  pid        text;
begin
  select * into t from public.tournaments where share_code = upper(p_code);
  if not found then
    raise exception 'Tournament not found' using errcode = 'P0002';
  end if;

  pid := encode(gen_random_bytes(6), 'hex');
  new_player := jsonb_build_object(
    'id', pid,
    'name', p_name,
    'rating', p_rating,
    'score', 0,
    'colorHistory', '[]'::jsonb,
    'opponents', '[]'::jsonb,
    'hasBye', false,
    'active', true
  );

  update public.tournaments
     set data = jsonb_set(
       data,
       '{players}',
       coalesce(data->'players', '[]'::jsonb) || new_player
     )
   where id = t.id
  returning * into t;

  return jsonb_build_object('tournament', to_jsonb(t), 'playerId', pid);
end;
$$;

grant execute on function public.join_tournament(text, text, int) to anon, authenticated;

-- Realtime: broadcast row changes so player/display views update live.
alter publication supabase_realtime add table public.tournaments;
