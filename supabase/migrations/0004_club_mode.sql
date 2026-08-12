-- Modo club/torneo: un solo plantel propio jugando contra rivales externos,
-- más el tono humor/serio del grupo. Todo aditivo y con default que
-- preserva el comportamiento actual (tone='humor'), no rompe nada de lo
-- que ya existe.

alter table groups
  add column if not exists tone text not null default 'humor' check (tone in ('humor', 'serio'));

alter table matches
  add column if not exists rival_name text,
  add column if not exists is_home boolean,
  add column if not exists season text;

-- Tabla de posiciones general de un torneo, cargada a mano por el usuario
-- (no se puede calcular sola: la app no conoce los resultados de partidos
-- entre otros equipos del torneo).
create table if not exists league_standings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  season text not null,
  team_name text not null,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  points int not null default 0,
  position int,
  created_at timestamptz not null default now(),
  unique (group_id, season, team_name)
);

create index if not exists idx_league_standings_group_season on league_standings(group_id, season);

alter table league_standings enable row level security;

create policy "members read league_standings" on league_standings for select
  using (exists (select 1 from group_members gm where gm.group_id = league_standings.group_id and gm.user_id = auth.uid()));
create policy "members write league_standings" on league_standings for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = league_standings.group_id and gm.user_id = auth.uid()));
create policy "members update league_standings" on league_standings for update
  using (exists (select 1 from group_members gm where gm.group_id = league_standings.group_id and gm.user_id = auth.uid()));
create policy "members delete league_standings" on league_standings for delete
  using (exists (select 1 from group_members gm where gm.group_id = league_standings.group_id and gm.user_id = auth.uid()));
