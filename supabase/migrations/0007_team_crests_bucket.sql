-- Bucket de Storage para escudos de equipo, usado en el cuestionario de alta.
insert into storage.buckets (id, name, public)
values ('team-crests', 'team-crests', true)
on conflict (id) do nothing;

create policy "public read team crests" on storage.objects for select
  using (bucket_id = 'team-crests');
create policy "authenticated upload team crests" on storage.objects for insert to authenticated
  with check (bucket_id = 'team-crests');
create policy "authenticated update team crests" on storage.objects for update to authenticated
  using (bucket_id = 'team-crests');
