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

## Sistema visual (definido en src/index.css con @theme)

- **Concepto:** objeto doméstico bien hecho. Blanco papel cálido / negro cálido en
  dark, un solo acento (verde `--color-marca`), un tono de alerta (`--color-alerta`,
  ladrillo apagado) para "en falta". Nada de grises fríos ni azules.
- **Tipografía:** display = Bricolage Grotesque (h1/h2/h3, marca, vacíos), body =
  Inter. Cargadas por `<link>` en index.html.
- **Tokens semánticos** (no usar `slate-*` ni `marca-600`): `bg`, `surface`,
  `surface-2`, `line`, `line-strong`, `ink`, `ink-soft`, `ink-faint`, `marca`,
  `marca-ink`, `marca-soft`, `marca-bright`, `alerta`, `alerta-soft`. Sombras
  `shadow-soft` / `shadow-lift`. Todos theme-aware por `prefers-color-scheme`.
- **Clases base:** `.input`, `.card`, `.eyebrow`, `.btn-primary`, `.btn-ghost`.
- **Elemento firma:** la fila de producto en Despensa — Stepper con número
  animado + barra de nivel (stock vs mínimo, con muesca en el umbral). Ahí va la
  intensidad; el resto queda tranquilo.
- **Motion** (`motion` / `motion/react`): helpers en `src/lib/ui.ts` (`spring`,
  `listItem`, `tap` para vibración). Transición de ruta en AppShell, listas con
  `layout` + AnimatePresence, toasts en `components/ui/Toast.tsx`. Todo respeta
  `prefers-reduced-motion` vía `useReducedMotion` y el media query del CSS.

## Reglas del proyecto

- Español argentino, natural. Sin emojis decorativos en la UI.
- Mobile-first siempre. Botones grandes (mínimo 44px) — se usa con una mano en el super.
- No romper el flujo: **confirmar compra repone stock**, esa es la lógica central.
- Antes de dar por hecho un cambio de esquema, correr `npm run build` (hace `tsc` + vite).
- Para revisar visualmente sin sesión: `npm run dev` + screenshot headless a
  ancho grande (1200) — el headless viejo a 390 recorta y engaña.

## Deploy

- **En vivo:** https://syn-mercaderia.netlify.app (Netlify, team `nicolaspamelinvarela`,
  project `syn-mercaderia` / id `1e3fc4ee-cce0-4458-8350-dda8a40d560a`).
- Carpeta linkeada (`.netlify/`, gitignored). `netlify.toml` + `public/_redirects`
  para ruteo SPA. Env vars `VITE_SUPABASE_*` en contexto `production`.
- Republicar: `npm run build && netlify deploy --prod --dir=dist`.
- Todavía NO hay auto-deploy por git push (se conecta el repo desde el panel de Netlify).
- CLI de Netlify ya logueada como Nico. El MCP de Netlify está configurado pero
  sin auth (401) — usar la CLI.

## Estado actual

- Fase 1 (MVP) implementada + rediseño premium + logo + deploy.
- Pendiente que Nico haga en Supabase: setear **Site URL** a la URL de Netlify en
  Authentication → URL Configuration (para que los mails de confirmación/reset
  apunten bien), o apagar "Confirm email".
- Pendiente fase 2: escáner de código de barras. Fase 3: foto de ticket, historial.
