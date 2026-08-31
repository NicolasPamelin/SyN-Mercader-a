-- ============================================================
--  SyN Mercadería — Historial de compras + fotos de ticket
--  Pegá TODO esto en el SQL Editor de Supabase y dale Run.
--  Es idempotente: se puede correr de nuevo sin romper nada.
-- ============================================================

create table if not exists public.compras (
  id          uuid primary key default gen_random_uuid(),
  hogar_id    uuid not null references public.hogares(id) on delete cascade,
  fecha       date not null default (now() at time zone 'America/Argentina/Cordoba')::date,
  items       jsonb not null default '[]',   -- [{nombre, cantidad, unidad}]
  cant_items  int not null default 0,
  total       numeric,
  nota        text,
  foto_path   text,
  creada_por  uuid not null default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists compras_hogar_idx on public.compras(hogar_id, fecha desc);

alter table public.compras enable row level security;
drop policy if exists compras_all on public.compras;
create policy compras_all on public.compras
  for all using (public.es_miembro(hogar_id)) with check (public.es_miembro(hogar_id));

-- ---------- Bucket privado para las fotos de tickets ----------
insert into storage.buckets (id, name, public)
values ('tickets', 'tickets', false)
on conflict (id) do nothing;

-- Rutas: '<hogar_id>/<compra_id>.jpg'. Solo miembros del hogar acceden.
drop policy if exists "tickets miembros lee" on storage.objects;
create policy "tickets miembros lee" on storage.objects
  for select using (
    bucket_id = 'tickets' and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros sube" on storage.objects;
create policy "tickets miembros sube" on storage.objects
  for insert with check (
    bucket_id = 'tickets' and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros actualiza" on storage.objects;
create policy "tickets miembros actualiza" on storage.objects
  for update using (
    bucket_id = 'tickets' and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros borra" on storage.objects;
create policy "tickets miembros borra" on storage.objects
  for delete using (
    bucket_id = 'tickets' and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );
