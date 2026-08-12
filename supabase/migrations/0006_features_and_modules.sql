-- Módulos opcionales por grupo (viáticos, multas, cuotas, convocatoria,
-- sponsors, multi-equipo, etc.), organizaciones multi-equipo, y las tablas
-- que le faltaban a esos módulos. También generaliza coaches -> staff con
-- rol, expenses con categoría, y training_rsvps -> rsvps (entrenamiento o
-- partido). Todo aditivo salvo los dos renombres, que no tienen datos
-- reales cargados todavía.

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  crest_url text,
  created_at timestamptz not null default now()
);

alter table groups
  add column if not exists organization_id uuid references organizations(id) on delete set null,
  add column if not exists features jsonb not null default '{
    "enfermeria": true, "viaticos": true, "multas": false, "cuotas": false,
    "entrenamientos": false, "convocatoria": false, "camposPersonalizados": false,
    "sponsors": false, "multiEquipo": false, "tablaPosiciones": false,
    "calendarioUnificado": false, "reservaCancha": false
  }'::jsonb;

alter table players
  add column if not exists fitness_cert_expiry date;

-- coaches -> staff_members, con rol
alter table if exists coaches rename to staff_members;
alter table staff_members
  add column if not exists role text not null default 'dt'
    check (role in ('dt', 'ayudante-de-campo', 'preparador-fisico', 'kinesiologo', 'otro'));

-- expenses: categoría (gasto genérico o cancha)
alter table expenses
  add column if not exists category text not null default 'gasto' check (category in ('gasto', 'cancha'));

create table if not exists player_charges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  type text not null check (type in ('multa', 'cuota')),
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  period text,
  date date not null default current_date,
  paid boolean not null default false,
  paid_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_player_charges_group on player_charges(group_id);
create index if not exists idx_player_charges_player on player_charges(player_id);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  logo_url text,
  link_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sponsors_group on sponsors(group_id);

-- training_rsvps -> rsvps genérico (entrenamiento o partido)
drop table if exists training_rsvps;
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  context text not null check (context in ('entrenamiento', 'partido')),
  context_id uuid not null,
  player_id uuid not null references players(id) on delete cascade,
  status text not null default 'sin-responder' check (status in ('va', 'no-va', 'sin-responder')),
  responded_at timestamptz,
  unique (context, context_id, player_id)
);

create index if not exists idx_rsvps_context on rsvps(context, context_id);
create index if not exists idx_rsvps_group on rsvps(group_id);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table organizations enable row level security;
alter table player_charges enable row level security;
alter table sponsors enable row level security;
alter table rsvps enable row level security;

-- Una organización es visible para cualquiera que sea miembro de al menos
-- un grupo que la referencia.
create policy "members read their organization" on organizations for select
  using (exists (
    select 1 from groups g
    join group_members gm on gm.group_id = g.id
    where g.organization_id = organizations.id and gm.user_id = auth.uid()
  ));
create policy "authenticated users create organizations" on organizations for insert to authenticated
  with check (true);

create policy "members read player_charges" on player_charges for select
  using (exists (select 1 from group_members gm where gm.group_id = player_charges.group_id and gm.user_id = auth.uid()));
create policy "members write player_charges" on player_charges for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = player_charges.group_id and gm.user_id = auth.uid()));
create policy "members update player_charges" on player_charges for update
  using (exists (select 1 from group_members gm where gm.group_id = player_charges.group_id and gm.user_id = auth.uid()));
create policy "members delete player_charges" on player_charges for delete
  using (exists (select 1 from group_members gm where gm.group_id = player_charges.group_id and gm.user_id = auth.uid()));

create policy "members read sponsors" on sponsors for select
  using (exists (select 1 from group_members gm where gm.group_id = sponsors.group_id and gm.user_id = auth.uid()));
create policy "members write sponsors" on sponsors for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = sponsors.group_id and gm.user_id = auth.uid()));
create policy "members update sponsors" on sponsors for update
  using (exists (select 1 from group_members gm where gm.group_id = sponsors.group_id and gm.user_id = auth.uid()));
create policy "members delete sponsors" on sponsors for delete
  using (exists (select 1 from group_members gm where gm.group_id = sponsors.group_id and gm.user_id = auth.uid()));

create policy "members read rsvps" on rsvps for select
  using (exists (select 1 from group_members gm where gm.group_id = rsvps.group_id and gm.user_id = auth.uid()));
create policy "members write rsvps" on rsvps for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = rsvps.group_id and gm.user_id = auth.uid()));
create policy "members update rsvps" on rsvps for update
  using (exists (select 1 from group_members gm where gm.group_id = rsvps.group_id and gm.user_id = auth.uid()));
create policy "members delete rsvps" on rsvps for delete
  using (exists (select 1 from group_members gm where gm.group_id = rsvps.group_id and gm.user_id = auth.uid()));
