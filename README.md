# SyN Mercadería

**En vivo:** https://syn-mercaderia.netlify.app

App web (mobile-first, instalable como PWA) para llevar el **stock de la despensa** y
armar la **lista del super**, compartida entre dos personas (Sofi + Nico).

- Sumás y descontás productos con botones grandes `+` / `−`.
- Cuando un producto baja de su **mínimo**, entra solo a la lista del super.
- **Modo super**: tildás lo que ponés en el carrito y al confirmar se repone el stock.
- Todo sincroniza en vivo entre los dos celulares (Supabase Realtime).

## Stack

- React + TypeScript + Vite
- Tailwind v4
- Supabase (Postgres + Auth + Realtime)
- vite-plugin-pwa
- Deploy: Netlify

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) → **New project** (plan Free alcanza).
2. Cuando termine de crearse, andá a **SQL Editor → New query**, pegá TODO el
   contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
3. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public** key (o una **publishable key** `sb_publishable_...`)

### 2. Configurar el entorno local

```bash
cp .env.example .env.local
```

Editá `.env.local` con los datos del paso anterior:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Correr

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`. Para probar desde el celular en la misma red WiFi,
usá la URL "Network" que imprime Vite.

### 4. Primer uso

1. Creá tu cuenta (email + contraseña).
2. Elegí **Crear nueva** despensa y ponele nombre.
3. En **Ajustes** vas a ver el **código de invitación**: pasáselo a tu pareja para
   que se sume desde su cuenta con "Tengo un código".
4. Empezá a cargar productos desde la pestaña **Despensa** (buscador → "Agregar X").

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build local |
| `npm run lint` | oxlint |

## Deploy a Netlify

Ya está deployado en el proyecto Netlify **syn-mercaderia**
(team `nicolaspamelinvarela`, project id `1e3fc4ee-cce0-4458-8350-dda8a40d560a`).
La carpeta ya está linkeada (`.netlify/`), con `netlify.toml` y `public/_redirects`
para el ruteo SPA. Las env vars `VITE_SUPABASE_*` están cargadas en el contexto
`production`.

Para volver a publicar después de un cambio:

```bash
npm run build
netlify deploy --prod --dir=dist
```

Para auto-deploy en cada `git push`: conectá el repo de GitHub desde el panel de
Netlify (Site configuration → Build & deploy → Link repository).

## Roadmap

- **Fase 2:** escaneo de código de barras (cámara del navegador) que mapea a tu
  catálogo, con ayuda de Open Food Facts para autocompletar el nombre.
- **Fase 3:** foto del ticket para reponer en lote, historial de consumo y
  sugerencias por frecuencia de compra.

## Estructura

```
supabase/schema.sql       Esquema completo de la base (idempotente)
src/lib/                   Cliente Supabase, tipos, constantes
src/context/               AuthContext (sesión) + DespensaContext (datos + acciones)
src/components/             AppShell (nav), Stepper, ProductoModal, iconos
src/pages/                  Login, Onboarding, Stock, Lista, Ajustes
```
