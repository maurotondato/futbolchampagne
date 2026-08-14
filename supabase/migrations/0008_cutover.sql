-- CUTOVER: migra el plantel actual (sin dueño, acceso público por
-- contraseña compartida) a ser el primer grupo real del sistema
-- multi-cuenta, dueño de un usuario autenticado.
--
-- Orden para correr esto:
--   1. Entrar a /login en la app y crear la cuenta con el email de abajo
--      (auth.users tiene que existir ANTES de correr este script, si no
--      el paso 3 no encuentra a quién hacer admin).
--   2. Correr este archivo entero en el SQL Editor de Supabase.
--   3. Confirmar en la app que entra directo (sin pasar por /onboarding)
--      y que el plantel/partidos de siempre siguen ahí.
--
-- Reemplazá el email de abajo si hace falta antes de correrlo.
do $$
declare
  admin_email text := 'maurotondato123@gmail.com';
  new_group_id uuid;
  admin_user_id uuid;
begin
  alter table groups add column if not exists invite_code text;
  update groups set invite_code = substr(md5(random()::text), 1, 8) where invite_code is null;
  alter table groups alter column invite_code set default substr(md5(random()::text), 1, 8);
  alter table groups alter column invite_code set not null;
  alter table groups add constraint groups_invite_code_key unique (invite_code);

  alter table players add column if not exists group_id uuid references groups(id) on delete cascade;
  alter table matches add column if not exists group_id uuid references groups(id) on delete cascade;
  alter table awards add column if not exists group_id uuid references groups(id) on delete cascade;
  alter table injuries add column if not exists group_id uuid references groups(id) on delete cascade;

  -- Si ya se corrió antes, no duplicar el grupo.
  select id into new_group_id from groups where slug = 'futbol-champagne-de-los-martes';
  if new_group_id is null then
    insert into groups (name, slug, format, tone, plan)
    values ('Fútbol Champagne de los Martes', 'futbol-champagne-de-los-martes', '7-amistoso', 'humor', 'free')
    returning id into new_group_id;
  end if;

  update players set group_id = new_group_id where group_id is null;
  update matches set group_id = new_group_id where group_id is null;
  update awards set group_id = new_group_id where group_id is null;
  update injuries set group_id = new_group_id where group_id is null;

  select id into admin_user_id from auth.users where email = admin_email;
  if admin_user_id is not null then
    insert into group_members (group_id, user_id, role)
    values (new_group_id, admin_user_id, 'admin')
    on conflict (group_id, user_id) do nothing;
  end if;
end $$;

-- A partir de acá todo partido/jugador nuevo tiene que traer group_id.
alter table players alter column group_id set not null;
alter table matches alter column group_id set not null;
alter table awards alter column group_id set not null;
alter table injuries alter column group_id set not null;

create index if not exists idx_players_group on players(group_id);
create index if not exists idx_matches_group on matches(group_id);
create index if not exists idx_awards_group on awards(group_id);
create index if not exists idx_injuries_group on injuries(group_id);

-- ---------------------------------------------------------------------
-- RLS: de "público para cualquiera con el link" a "miembros del grupo".
-- ---------------------------------------------------------------------
drop policy if exists "public read players" on players;
drop policy if exists "public write players" on players;
drop policy if exists "public update players" on players;
drop policy if exists "public delete players" on players;

create policy "members read players" on players for select
  using (exists (select 1 from group_members gm where gm.group_id = players.group_id and gm.user_id = auth.uid()));
create policy "members write players" on players for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = players.group_id and gm.user_id = auth.uid()));
create policy "members update players" on players for update
  using (exists (select 1 from group_members gm where gm.group_id = players.group_id and gm.user_id = auth.uid()));
create policy "members delete players" on players for delete
  using (exists (select 1 from group_members gm where gm.group_id = players.group_id and gm.user_id = auth.uid()));

drop policy if exists "public read matches" on matches;
drop policy if exists "public write matches" on matches;
drop policy if exists "public update matches" on matches;
drop policy if exists "public delete matches" on matches;

create policy "members read matches" on matches for select
  using (exists (select 1 from group_members gm where gm.group_id = matches.group_id and gm.user_id = auth.uid()));
create policy "members write matches" on matches for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = matches.group_id and gm.user_id = auth.uid()));
create policy "members update matches" on matches for update
  using (exists (select 1 from group_members gm where gm.group_id = matches.group_id and gm.user_id = auth.uid()));
create policy "members delete matches" on matches for delete
  using (exists (select 1 from group_members gm where gm.group_id = matches.group_id and gm.user_id = auth.uid()));

drop policy if exists "public read lineup" on lineup_slots;
drop policy if exists "public write lineup" on lineup_slots;
drop policy if exists "public update lineup" on lineup_slots;
drop policy if exists "public delete lineup" on lineup_slots;

create policy "members read lineup" on lineup_slots for select
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = lineup_slots.match_id and gm.user_id = auth.uid()
  ));
create policy "members write lineup" on lineup_slots for insert to authenticated
  with check (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = lineup_slots.match_id and gm.user_id = auth.uid()
  ));
create policy "members update lineup" on lineup_slots for update
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = lineup_slots.match_id and gm.user_id = auth.uid()
  ));
create policy "members delete lineup" on lineup_slots for delete
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = lineup_slots.match_id and gm.user_id = auth.uid()
  ));

drop policy if exists "public read stats" on player_match_stats;
drop policy if exists "public write stats" on player_match_stats;
drop policy if exists "public update stats" on player_match_stats;
drop policy if exists "public delete stats" on player_match_stats;

create policy "members read stats" on player_match_stats for select
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = player_match_stats.match_id and gm.user_id = auth.uid()
  ));
create policy "members write stats" on player_match_stats for insert to authenticated
  with check (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = player_match_stats.match_id and gm.user_id = auth.uid()
  ));
create policy "members update stats" on player_match_stats for update
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = player_match_stats.match_id and gm.user_id = auth.uid()
  ));
create policy "members delete stats" on player_match_stats for delete
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = player_match_stats.match_id and gm.user_id = auth.uid()
  ));

drop policy if exists "public read media" on match_media;
drop policy if exists "public write media" on match_media;
drop policy if exists "public update media" on match_media;
drop policy if exists "public delete media" on match_media;

create policy "members read media" on match_media for select
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = match_media.match_id and gm.user_id = auth.uid()
  ));
create policy "members write media" on match_media for insert to authenticated
  with check (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = match_media.match_id and gm.user_id = auth.uid()
  ));
create policy "members update media" on match_media for update
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = match_media.match_id and gm.user_id = auth.uid()
  ));
create policy "members delete media" on match_media for delete
  using (exists (
    select 1 from matches m join group_members gm on gm.group_id = m.group_id
    where m.id = match_media.match_id and gm.user_id = auth.uid()
  ));

drop policy if exists "public read awards" on awards;
drop policy if exists "public write awards" on awards;
drop policy if exists "public update awards" on awards;
drop policy if exists "public delete awards" on awards;

create policy "members read awards" on awards for select
  using (exists (select 1 from group_members gm where gm.group_id = awards.group_id and gm.user_id = auth.uid()));
create policy "members write awards" on awards for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = awards.group_id and gm.user_id = auth.uid()));
create policy "members update awards" on awards for update
  using (exists (select 1 from group_members gm where gm.group_id = awards.group_id and gm.user_id = auth.uid()));
create policy "members delete awards" on awards for delete
  using (exists (select 1 from group_members gm where gm.group_id = awards.group_id and gm.user_id = auth.uid()));

-- injuries ya tenía policies "public ..." desde 0002.
drop policy if exists "public read injuries" on injuries;
drop policy if exists "public write injuries" on injuries;
drop policy if exists "public update injuries" on injuries;
drop policy if exists "public delete injuries" on injuries;

create policy "members read injuries" on injuries for select
  using (exists (select 1 from group_members gm where gm.group_id = injuries.group_id and gm.user_id = auth.uid()));
create policy "members write injuries" on injuries for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = injuries.group_id and gm.user_id = auth.uid()));
create policy "members update injuries" on injuries for update
  using (exists (select 1 from group_members gm where gm.group_id = injuries.group_id and gm.user_id = auth.uid()));
create policy "members delete injuries" on injuries for delete
  using (exists (select 1 from group_members gm where gm.group_id = injuries.group_id and gm.user_id = auth.uid()));
