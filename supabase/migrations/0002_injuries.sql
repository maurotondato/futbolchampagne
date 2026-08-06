-- Enfermería: lista de jugadores lesionados, con nombre de la lesión y
-- fecha estimada de alta. Mismo modelo de acceso que el resto de la app:
-- lectura y escritura públicas, sin login por usuario.
create table if not exists injuries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  injury_name text not null,
  start_date date not null default current_date,
  estimated_return_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_injuries_player on injuries(player_id);

alter table injuries enable row level security;

create policy "public read injuries" on injuries for select using (true);
create policy "public write injuries" on injuries for insert to public with check (true);
create policy "public update injuries" on injuries for update to public using (true);
create policy "public delete injuries" on injuries for delete to public using (true);
