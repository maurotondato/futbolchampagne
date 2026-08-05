-- Fútbol Champagne de los Martes — esquema inicial
-- Ejecutar en el SQL editor de Supabase (o vía `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Jugadores
-- ---------------------------------------------------------------------
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  phone text,
  photo_url text,
  birthdate date,
  dominant_foot text not null default 'derecha' check (dominant_foot in ('izquierda', 'derecha', 'ambidiestro')),
  favorite_position text not null default 'MED' check (favorite_position in ('ARQ', 'DEF', 'MED', 'DEL')),
  debut_date date,
  active boolean not null default true,
  -- Atributos de la carta estilo FIFA (humor incluido), 0-99
  aguante int not null default 70,
  estado_fisico int not null default 70,
  llegar_tarde int not null default 50,
  humo int not null default 50,
  definicion int not null default 70,
  quite int not null default 65,
  pase int not null default 68,
  iq_futbolistico int not null default 65,
  protesta_arbitro int not null default 55,
  humor int not null default 75,
  garra int not null default 72,
  sangre int not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Partidos (uno por martes)
-- ---------------------------------------------------------------------
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  team_a_name text not null default 'Equipo Champagne',
  team_b_name text not null default 'Equipo Fernet',
  team_a_score int,
  team_b_score int,
  status text not null default 'scheduled' check (status in ('scheduled', 'played')),
  mvp_player_id uuid references players(id) on delete set null,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Posición fija de cada jugador dentro de la formación del equipo
create table if not exists lineup_slots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  -- Formación fija: 1 arquero, 3 defensores (lateral izq., central, lateral
  -- der.), 2 mediocampistas, 1 delantero.
  slot text not null check (slot in ('ARQ', 'LI', 'DFC', 'LD', 'MED1', 'MED2', 'DEL')),
  unique (match_id, player_id),
  unique (match_id, team, slot)
);

-- Estadísticas de cada jugador en cada partido (se carga después del partido)
create table if not exists player_match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  goals int not null default 0,
  assists int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  saves int not null default 0,
  errors int not null default 0,
  goals_against int not null default 0,
  rating numeric(3,1) not null default 6.0 check (rating >= 1 and rating <= 10),
  is_mvp boolean not null default false,
  is_goalkeeper boolean not null default false,
  minutes_late int not null default 0,
  unique (match_id, player_id)
);

-- Momentos del partido: goles, atajadas, papelones
create table if not exists match_media (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  type text not null check (type in ('gol', 'atajada', 'papelon')),
  url text not null,
  caption text,
  votes int not null default 0,
  created_at timestamptz not null default now()
);

-- Premios / awards de temporada
create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  season text not null,
  player_id uuid references players(id) on delete cascade,
  player_ids uuid[],
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_lineup_slots_match on lineup_slots(match_id);
create index if not exists idx_stats_match on player_match_stats(match_id);
create index if not exists idx_stats_player on player_match_stats(player_id);
create index if not exists idx_media_match on match_media(match_id);

-- ---------------------------------------------------------------------
-- Row Level Security: lectura y escritura públicas. No hay login por
-- usuario — el único filtro es la contraseña compartida del grupo a nivel
-- de la app (PasswordGate, "fulbito"), no autenticación real de Supabase.
-- Cualquiera con el link y la contraseña puede armar equipos, cargar
-- resultados y editar jugadores, a propósito: es una app casera para un
-- grupo de amigos, no un sistema con roles.
-- ---------------------------------------------------------------------
alter table players enable row level security;
alter table matches enable row level security;
alter table lineup_slots enable row level security;
alter table player_match_stats enable row level security;
alter table match_media enable row level security;
alter table awards enable row level security;

create policy "public read players" on players for select using (true);
create policy "public write players" on players for insert to public with check (true);
create policy "public update players" on players for update to public using (true);
create policy "public delete players" on players for delete to public using (true);

create policy "public read matches" on matches for select using (true);
create policy "public write matches" on matches for insert to public with check (true);
create policy "public update matches" on matches for update to public using (true);
create policy "public delete matches" on matches for delete to public using (true);

create policy "public read lineup" on lineup_slots for select using (true);
create policy "public write lineup" on lineup_slots for insert to public with check (true);
create policy "public update lineup" on lineup_slots for update to public using (true);
create policy "public delete lineup" on lineup_slots for delete to public using (true);

create policy "public read stats" on player_match_stats for select using (true);
create policy "public write stats" on player_match_stats for insert to public with check (true);
create policy "public update stats" on player_match_stats for update to public using (true);
create policy "public delete stats" on player_match_stats for delete to public using (true);

create policy "public read media" on match_media for select using (true);
create policy "public write media" on match_media for insert to public with check (true);
create policy "public update media" on match_media for update to public using (true);
create policy "public delete media" on match_media for delete to public using (true);

create policy "public read awards" on awards for select using (true);
create policy "public write awards" on awards for insert to public with check (true);
create policy "public update awards" on awards for update to public using (true);
create policy "public delete awards" on awards for delete to public using (true);

-- Buckets de Storage para fotos de jugadores y momentos del partido.
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('match-media', 'match-media', true)
on conflict (id) do nothing;

create policy "public read player photos" on storage.objects for select
  using (bucket_id = 'player-photos');
create policy "public upload player photos" on storage.objects for insert to public
  with check (bucket_id = 'player-photos');
create policy "public update player photos" on storage.objects for update to public
  using (bucket_id = 'player-photos');
create policy "public delete player photos" on storage.objects for delete to public
  using (bucket_id = 'player-photos');

create policy "public read match media" on storage.objects for select
  using (bucket_id = 'match-media');
create policy "public upload match media" on storage.objects for insert to public
  with check (bucket_id = 'match-media');
create policy "public update match media" on storage.objects for update to public
  using (bucket_id = 'match-media');
create policy "public delete match media" on storage.objects for delete to public
  using (bucket_id = 'match-media');

-- ---------------------------------------------------------------------
-- Seed: plantel real del grupo (se puede editar/borrar desde /admin)
-- ---------------------------------------------------------------------
insert into players (name, favorite_position, phone, photo_url) values
  ('Mariano Alcuaz', 'ARQ', '2223428916', '/players/mariano-alcuaz.jpg'),
  ('German Fiordelli', 'DEF', '2223431407', '/players/german-fiordelli.jpg'),
  ('Mauri Fiordelli', 'DEF', '2223674209', '/players/mauri-fiordelli.jpg'),
  ('Ezequiel Jaime', 'DEF', '2223534574', '/players/ezequiel-jaime.jpg'),
  ('Nico Leoni', 'DEF', '2223464220', '/players/nico-leoni.jpg'),
  ('Marcos Llanos', 'MED', '2223432496', '/players/marcos-llanos.jpg'),
  ('Juan M Muñoz', 'MED', '1132361413', '/players/juan-m-munoz.jpg'),
  ('Jonas Manso', 'MED', '2223574213', '/players/jonas-manso.jpg'),
  ('Manu Mendizabal', 'MED', '2216208746', '/players/manuel-mendizabal.jpg'),
  ('Mateo Manso', 'MED', '2223502767', '/players/mateo-manso.jpg'),
  ('Franco Nieto', 'DEL', '2223464183', '/players/franco-nieto.jpg'),
  ('Natalio Napolitani', 'DEL', '1155829579', '/players/natalio-napolitani.jpg'),
  ('Rodrigo Olivera', 'DEL', '2223513781', '/players/rodrigo-olivera.jpg'),
  ('Pablo Piazza', 'DEL', '2223461938', '/players/pablo-piazza.jpg'),
  ('Ramiro Rey', 'ARQ', '2223428304', '/players/ramiro-rey.jpg'),
  ('Augusto Rossi', 'DEF', '2223504190', '/players/augusto-ross.jpg'),
  ('Marcos Rivaletto', 'MED', '2223463198', '/players/marcos-rivaletto.jpg'),
  ('Fede Sargiotti', 'DEL', '2223511073', '/players/fede-sargiotti.jpg'),
  ('Matias Yornet', 'MED', '2223505173', '/players/matias-yornet.jpg'),
  ('Mario Llanos', 'DEF', '2223425586', null),
  ('Santi Cupparo', 'DEL', '2223463681', '/players/santi-cupparo.jpg'),
  ('Beto', 'DEF', '2223433889', null),
  ('Toto Cardozo', 'MED', '2223490648', '/players/toto-cardozo.jpg'),
  ('Mauro Tondato', 'DEL', '2223431190', '/players/mauro-tondato.jpg')
on conflict do nothing;
