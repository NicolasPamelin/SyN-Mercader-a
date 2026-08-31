-- ============================================================
--  SyN Mercadería — esquema de base de datos
--  Pegá TODO esto en el SQL Editor de tu proyecto Supabase nuevo
--  (Dashboard -> SQL Editor -> New query -> Run).
--  Es idempotente: lo podés correr de nuevo sin romper nada.
-- ============================================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";

-- ============================================================
--  TABLAS
-- ============================================================

-- Un "hogar" es la despensa compartida (Sofi + Nico).
create table if not exists public.hogares (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null default 'Mi casa',
  codigo_invite  text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  creado_por     uuid not null references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now()
);

-- Quién pertenece a cada hogar.
create table if not exists public.miembros (
  hogar_id   uuid not null references public.hogares(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rol        text not null default 'miembro' check (rol in ('dueño','miembro')),
  alias      text,
  created_at timestamptz not null default now(),
  primary key (hogar_id, user_id)
);

-- Catálogo + stock. Cada fila es un producto de la despensa.
create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  hogar_id    uuid not null references public.hogares(id) on delete cascade,
  nombre      text not null,
  categoria   text not null default 'Almacén',
  unidad      text not null default 'unidad',
  cantidad    numeric not null default 0 check (cantidad >= 0),
  minimo      numeric not null default 0 check (minimo >= 0),
  paso        numeric not null default 1,   -- de a cuánto suma/resta el botón: 1 o 0.5
  esencial    boolean not null default false,
  archivado   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists productos_hogar_idx on public.productos(hogar_id) where not archivado;

-- Si ya tenías la tabla creada de antes, esto suma la columna nueva sin romper nada.
alter table public.productos add column if not exists paso numeric not null default 1;

-- Lista de compras materializada (lo que hay que llevar del super).
create table if not exists public.items_compra (
  id           uuid primary key default gen_random_uuid(),
  hogar_id     uuid not null references public.hogares(id) on delete cascade,
  producto_id  uuid references public.productos(id) on delete cascade,
  nombre_libre text,                              -- para items que no están en el catálogo
  cantidad     numeric not null default 1 check (cantidad > 0),
  estado       text not null default 'pendiente' check (estado in ('pendiente','en_carrito')),
  origen       text not null default 'manual' check (origen in ('auto','manual')),
  created_at   timestamptz not null default now(),
  -- un producto del catálogo no puede estar dos veces en la lista
  unique (hogar_id, producto_id)
);
create index if not exists items_compra_hogar_idx on public.items_compra(hogar_id);

-- ============================================================
--  updated_at automático en productos
-- ============================================================
create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists productos_updated_at on public.productos;
create trigger productos_updated_at
  before update on public.productos
  for each row execute function public.tocar_updated_at();

-- ============================================================
--  Sincronizar lista de compras cuando cambia el stock
--  Si cantidad <= minimo  -> asegura un item 'auto' en la lista
--  Si cantidad  > minimo  -> saca el item 'auto' (si nadie lo tocó)
-- ============================================================
create or replace function public.sincronizar_lista()
returns trigger language plpgsql as $$
begin
  if new.archivado then
    delete from public.items_compra where producto_id = new.id;
    return new;
  end if;

  if new.cantidad <= new.minimo and new.minimo > 0 then
    insert into public.items_compra (hogar_id, producto_id, cantidad, origen, estado)
    values (
      new.hogar_id,
      new.id,
      greatest(new.minimo - new.cantidad, 1),
      'auto',
      'pendiente'
    )
    on conflict (hogar_id, producto_id) do update
      set cantidad = greatest(new.minimo - new.cantidad, 1)
      where items_compra.origen = 'auto'
        and items_compra.estado = 'pendiente';
  else
    delete from public.items_compra
      where producto_id = new.id and origen = 'auto' and estado = 'pendiente';
  end if;

  return new;
end $$;

drop trigger if exists productos_sincronizar_lista on public.productos;
create trigger productos_sincronizar_lista
  after insert or update of cantidad, minimo, archivado on public.productos
  for each row execute function public.sincronizar_lista();

-- ============================================================
--  RPC: crear un hogar (y sumarme como dueño)
-- ============================================================
create or replace function public.crear_hogar(p_nombre text, p_alias text default null)
returns public.hogares
language plpgsql security definer set search_path = public as $$
declare
  h public.hogares;
begin
  insert into public.hogares (nombre, creado_por)
  values (coalesce(nullif(trim(p_nombre),''),'Mi casa'), auth.uid())
  returning * into h;

  insert into public.miembros (hogar_id, user_id, rol, alias)
  values (h.id, auth.uid(), 'dueño', p_alias);

  return h;
end $$;

-- ============================================================
--  RPC: unirme a un hogar con el código de invitación
-- ============================================================
create or replace function public.unirse_a_hogar(p_codigo text, p_alias text default null)
returns public.hogares
language plpgsql security definer set search_path = public as $$
declare
  h public.hogares;
begin
  select * into h from public.hogares
   where codigo_invite = upper(trim(p_codigo));

  if h.id is null then
    raise exception 'Código inválido';
  end if;

  insert into public.miembros (hogar_id, user_id, rol, alias)
  values (h.id, auth.uid(), 'miembro', p_alias)
  on conflict (hogar_id, user_id) do nothing;

  return h;
end $$;

-- ============================================================
--  Helper: ¿este usuario pertenece a este hogar?
-- ============================================================
create or replace function public.es_miembro(p_hogar uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.miembros
    where hogar_id = p_hogar and user_id = auth.uid()
  );
$$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.hogares      enable row level security;
alter table public.miembros     enable row level security;
alter table public.productos    enable row level security;
alter table public.items_compra enable row level security;

-- hogares: veo/edito los hogares donde soy miembro
drop policy if exists hogares_select on public.hogares;
create policy hogares_select on public.hogares
  for select using (public.es_miembro(id));

drop policy if exists hogares_update on public.hogares;
create policy hogares_update on public.hogares
  for update using (public.es_miembro(id));

-- miembros: veo los miembros de mis hogares; me puedo borrar a mí mismo
drop policy if exists miembros_select on public.miembros;
create policy miembros_select on public.miembros
  for select using (public.es_miembro(hogar_id));

drop policy if exists miembros_delete on public.miembros;
create policy miembros_delete on public.miembros
  for delete using (user_id = auth.uid());

-- productos: acceso total dentro de mis hogares
drop policy if exists productos_all on public.productos;
create policy productos_all on public.productos
  for all using (public.es_miembro(hogar_id)) with check (public.es_miembro(hogar_id));

-- items_compra: acceso total dentro de mis hogares
drop policy if exists items_compra_all on public.items_compra;
create policy items_compra_all on public.items_compra
  for all using (public.es_miembro(hogar_id)) with check (public.es_miembro(hogar_id));

-- ============================================================
--  REALTIME (para que Sofi y Nico se vean los cambios en vivo)
-- ============================================================
alter publication supabase_realtime add table public.productos;
alter publication supabase_realtime add table public.items_compra;

-- ============================================================
--  HISTORIAL DE COMPRAS  (fase 3)
--  Cada vez que confirmás una compra se guarda un registro con
--  qué llevaste ese día. La foto del ticket es opcional.
-- ============================================================
create table if not exists public.compras (
  id          uuid primary key default gen_random_uuid(),
  hogar_id    uuid not null references public.hogares(id) on delete cascade,
  fecha       date not null default (now() at time zone 'America/Argentina/Cordoba')::date,
  items       jsonb not null default '[]',   -- [{nombre, cantidad, unidad}]
  cant_items  int not null default 0,
  total       numeric,
  nota        text,
  foto_path   text,                          -- ruta en el bucket 'tickets'
  creada_por  uuid not null default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists compras_hogar_idx on public.compras(hogar_id, fecha desc);

alter table public.compras enable row level security;
drop policy if exists compras_all on public.compras;
create policy compras_all on public.compras
  for all using (public.es_miembro(hogar_id)) with check (public.es_miembro(hogar_id));

-- ---------- Bucket de fotos de tickets (privado) ----------
insert into storage.buckets (id, name, public)
values ('tickets', 'tickets', false)
on conflict (id) do nothing;

-- Solo los miembros del hogar pueden ver/subir/borrar las fotos de ese hogar.
-- Las rutas son '<hogar_id>/<compra_id>.jpg'.
drop policy if exists "tickets miembros lee" on storage.objects;
create policy "tickets miembros lee" on storage.objects
  for select using (
    bucket_id = 'tickets'
    and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros sube" on storage.objects;
create policy "tickets miembros sube" on storage.objects
  for insert with check (
    bucket_id = 'tickets'
    and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros actualiza" on storage.objects;
create policy "tickets miembros actualiza" on storage.objects
  for update using (
    bucket_id = 'tickets'
    and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "tickets miembros borra" on storage.objects;
create policy "tickets miembros borra" on storage.objects
  for delete using (
    bucket_id = 'tickets'
    and exists (
      select 1 from public.miembros m
      where m.user_id = auth.uid()
        and m.hogar_id::text = (storage.foldername(name))[1]
    )
  );
