-- ============================================================
--  Keep-alive real: una ESCRITURA, no una lectura.
--  Una lectura con la anon key no le alcanza a Supabase como
--  "actividad suficiente" para no pausar el proyecto (confirmado:
--  el 25/09/2026 llegó el aviso de pausa con el ping de lectura
--  ya corriendo bien desde el 14/09). Esta tabla de un solo
--  registro se actualiza en cada corrida del workflow.
--  Pegá esto en el SQL Editor de Supabase y dale Run.
-- ============================================================

create table if not exists public._keepalive (
  id        int primary key default 1,
  pinged_at timestamptz not null default now()
);
insert into public._keepalive (id) values (1) on conflict (id) do nothing;

alter table public._keepalive enable row level security;

-- Abierta a escritura con la anon key a propósito: es solo un timestamp,
-- no hay datos sensibles. El workflow de GitHub Actions la usa sin login.
drop policy if exists keepalive_cualquiera on public._keepalive;
create policy keepalive_cualquiera on public._keepalive
  for all using (true) with check (true);
