-- Multi-tenancy: cada grupo de amigos es un "group" con su propio plantel,
-- partidos, etc. Esta migración solo agrega las tablas nuevas — todavía no
-- toca los datos ni las políticas de players/matches/awards/injuries, así
-- que la app actual (con el gate de contraseña compartida) sigue
-- funcionando exactamente igual hasta que se conecte Supabase Auth.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Grupos
-- ---------------------------------------------------------------------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  crest_url text,
  format text not null default '7-amistoso' check (format in ('7-amistoso', '7-torneo', '11-torneo')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- Quién pertenece a cada grupo y con qué rol.
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_group_members_user on group_members(user_id);

-- ---------------------------------------------------------------------
-- Director técnico
-- ---------------------------------------------------------------------
create table if not exists coaches (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_coaches_group on coaches(group_id);

-- ---------------------------------------------------------------------
-- Viáticos: gastos del equipo y cómo se dividen
-- ---------------------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  paid_by_player_id uuid not null references players(id) on delete cascade,
  date date not null default current_date,
  split_among uuid[] not null,
  created_at timestamptz not null default now()
);

-- Pagos entre jugadores para saldar deudas de gastos compartidos.
create table if not exists expense_settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_player_id uuid not null references players(id) on delete cascade,
  to_player_id uuid not null references players(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_group on expenses(group_id);
create index if not exists idx_settlements_group on expense_settlements(group_id);

-- ---------------------------------------------------------------------
-- Row Level Security: estas tablas SÍ requieren autenticación real —
-- cada usuario solo ve y edita los grupos de los que es miembro.
-- ---------------------------------------------------------------------
alter table groups enable row level security;
alter table group_members enable row level security;
alter table coaches enable row level security;
alter table expenses enable row level security;
alter table expense_settlements enable row level security;

create policy "members read their group" on groups for select
  using (exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid()));
create policy "authenticated users create groups" on groups for insert to authenticated
  with check (true);
create policy "admins update their group" on groups for update
  using (exists (select 1 from group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid() and gm.role = 'admin'));

create policy "members read group_members of their group" on group_members for select
  using (exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid()));
create policy "users join a group" on group_members for insert to authenticated
  with check (user_id = auth.uid());
create policy "admins manage group_members" on group_members for update
  using (exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin'));
create policy "admins remove group_members" on group_members for delete
  using (exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid() and gm.role = 'admin'));

create policy "members read coaches" on coaches for select
  using (exists (select 1 from group_members gm where gm.group_id = coaches.group_id and gm.user_id = auth.uid()));
create policy "members write coaches" on coaches for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = coaches.group_id and gm.user_id = auth.uid()));
create policy "members update coaches" on coaches for update
  using (exists (select 1 from group_members gm where gm.group_id = coaches.group_id and gm.user_id = auth.uid()));
create policy "members delete coaches" on coaches for delete
  using (exists (select 1 from group_members gm where gm.group_id = coaches.group_id and gm.user_id = auth.uid()));

create policy "members read expenses" on expenses for select
  using (exists (select 1 from group_members gm where gm.group_id = expenses.group_id and gm.user_id = auth.uid()));
create policy "members write expenses" on expenses for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = expenses.group_id and gm.user_id = auth.uid()));
create policy "members update expenses" on expenses for update
  using (exists (select 1 from group_members gm where gm.group_id = expenses.group_id and gm.user_id = auth.uid()));
create policy "members delete expenses" on expenses for delete
  using (exists (select 1 from group_members gm where gm.group_id = expenses.group_id and gm.user_id = auth.uid()));

create policy "members read settlements" on expense_settlements for select
  using (exists (select 1 from group_members gm where gm.group_id = expense_settlements.group_id and gm.user_id = auth.uid()));
create policy "members write settlements" on expense_settlements for insert to authenticated
  with check (exists (select 1 from group_members gm where gm.group_id = expense_settlements.group_id and gm.user_id = auth.uid()));
create policy "members update settlements" on expense_settlements for update
  using (exists (select 1 from group_members gm where gm.group_id = expense_settlements.group_id and gm.user_id = auth.uid()));
create policy "members delete settlements" on expense_settlements for delete
  using (exists (select 1 from group_members gm where gm.group_id = expense_settlements.group_id and gm.user_id = auth.uid()));
