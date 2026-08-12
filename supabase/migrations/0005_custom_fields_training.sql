-- Campos de ficha configurables por grupo + entrenamientos. Aditivo: no
-- toca columnas existentes de players salvo agregar custom_fields (jsonb,
-- default vacío), así que no rompe nada de lo que ya hay cargado.

alter table players
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

create table if not exists player_field_definitions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  key text not null,
  label text not null,
  type text not null check (type in ('text', 'number', 'date', 'boolean', 'select')),
  options text[],
  "order" int not null default 0,
  unique (group_id, key)
);

create index if not exists idx_player_field_definitions_group on player_field_definitions(group_id);

create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  date date not null,
  time text,
  location text,
  notes text,
  bring_items text,
  created_at timestamptz not null default now()
);

create table if not exists training_rsvps (
  id uuid primary key default gen_random_uuid(),
  training_session_id uuid not null references training_sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status text not null default 'sin-responder' check (status in ('va', 'no-va', 'sin-responder')),
  responded_at timestamptz,
  unique (training_session_id, player_id)
);

create index if not exists idx_training_sessions_group on training_sessions(group_id);
create index if not exists idx_training_rsvps_session on training_rsvps(training_session_id);

alter table player_field_definitions enable row level security;
alter table training_sessions enable row level security;
alter table training_rsvps enable row level security;

create policy "members read field_definitions" on player_field_definitions for select
  using (exists (select 1 from group_members gm where gm.group_id = player_field_definitions.group_id and gm.user_id = auth.uid()));
create policy "members write field_definitions" on player_field_definitions for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = player_field_definitions.group_id and gm.user_id = auth.uid()));
create policy "members update field_definitions" on player_field_definitions for update
  using (exists (select 1 from group_members gm where gm.group_id = player_field_definitions.group_id and gm.user_id = auth.uid()));
create policy "members delete field_definitions" on player_field_definitions for delete
  using (exists (select 1 from group_members gm where gm.group_id = player_field_definitions.group_id and gm.user_id = auth.uid()));

create policy "members read training_sessions" on training_sessions for select
  using (exists (select 1 from group_members gm where gm.group_id = training_sessions.group_id and gm.user_id = auth.uid()));
create policy "members write training_sessions" on training_sessions for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = training_sessions.group_id and gm.user_id = auth.uid()));
create policy "members update training_sessions" on training_sessions for update
  using (exists (select 1 from group_members gm where gm.group_id = training_sessions.group_id and gm.user_id = auth.uid()));
create policy "members delete training_sessions" on training_sessions for delete
  using (exists (select 1 from group_members gm where gm.group_id = training_sessions.group_id and gm.user_id = auth.uid()));

create policy "members read training_rsvps" on training_rsvps for select
  using (exists (
    select 1 from training_sessions ts
    join group_members gm on gm.group_id = ts.group_id
    where ts.id = training_rsvps.training_session_id and gm.user_id = auth.uid()
  ));
create policy "members write training_rsvps" on training_rsvps for insert to authenticated
  with check (exists (
    select 1 from training_sessions ts
    join group_members gm on gm.group_id = ts.group_id
    where ts.id = training_rsvps.training_session_id and gm.user_id = auth.uid()
  ));
create policy "members update training_rsvps" on training_rsvps for update
  using (exists (
    select 1 from training_sessions ts
    join group_members gm on gm.group_id = ts.group_id
    where ts.id = training_rsvps.training_session_id and gm.user_id = auth.uid()
  ));
create policy "members delete training_rsvps" on training_rsvps for delete
  using (exists (
    select 1 from training_sessions ts
    join group_members gm on gm.group_id = ts.group_id
    where ts.id = training_rsvps.training_session_id and gm.user_id = auth.uid()
  ));
