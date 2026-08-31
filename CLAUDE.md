# CLAUDE.md — SyN Mercadería

App de stock de despensa + lista del super, compartida entre Sofi y Nico.
**No tiene nada que ver con el proyecto de arbitraje** (que vive en otra carpeta).

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind v4 (config vía `@theme` en `src/index.css`, sin `tailwind.config`)
- Supabase: Postgres + Auth (email/password) + Realtime
- vite-plugin-pwa (instalable en el celu)
- Deploy objetivo: Netlify

## Cómo está armado

- **`supabase/schema.sql`**: fuente de verdad del esquema. Idempotente. Si cambia
  el modelo de datos, se edita acá y el usuario lo re-corre en el SQL Editor.
  (El MCP de Supabase conectado apunta al proyecto de arbitraje, NO a este —
  no usar `apply_migration` contra este proyecto.)
- **`src/context/AuthContext.tsx`**: sesión de Supabase.
- **`src/context/DespensaContext.tsx`**: carga hogar + productos + lista, se
  suscribe a Realtime y expone todas las acciones. Updates optimistas.
- **`src/pages/`**: `Login`, `Onboarding` (crear/unirse a hogar), `Stock`,
  `Lista` (incluye "modo super"), `Ajustes`.

## Modelo de datos

- `hogares` — la despensa compartida, con `codigo_invite` para sumar a la pareja.
- `miembros` — usuarios ↔ hogar.
- `productos` — catálogo + stock (`cantidad`, `minimo`, `esencial`, `categoria`, `unidad`).
- `items_compra` — lista del super materializada. Un trigger la sincroniza:
  si `cantidad <= minimo` (y `minimo > 0`) inserta un item `origen='auto'`;
  si sube, lo saca (solo si nadie lo pasó al carrito).

## Reglas del proyecto

- Español argentino, natural. Sin emojis decorativos en la UI.
- Mobile-first siempre. Botones grandes (mínimo 44px) — se usa con una mano en el super.
- No romper el flujo: **confirmar compra repone stock**, esa es la lógica central.
- Antes de dar por hecho un cambio de esquema, correr `npm run build` (hace `tsc` + vite).

## Estado actual

- Fase 1 (MVP) implementada: catálogo, +/- rápido, lista automática + manual,
  modo super con reposición, PWA, realtime.
- Falta: que el usuario cree el proyecto Supabase y complete `.env.local`.
- Pendiente fase 2: escáner de código de barras. Fase 3: foto de ticket, historial.
