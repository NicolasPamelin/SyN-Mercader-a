# Marca

- `SyN_Logo.jpeg` — logo original que pasó Nico (referencia).

En la app **no** se usa ese JPEG directo (tiene fondo, gradientes metálicos y
mucho detalle que no rinde a tamaño chico). Se redibujó como vector plano:

- **En pantalla:** componente `src/components/Logo.tsx` (`LogoMark`) — aro doble
  verde + techo de casa + "SyN" serif (Fraunces). Theme-aware, nítido a cualquier
  tamaño. Se usa en la barra, el login y el splash.
- **Ícono de la app / favicon:** `public/favicon.svg`, `public/icon-192.png`,
  `public/icon-512.png`, `public/icon-maskable.png`, `public/apple-touch-icon.png`
  — tile verde con techo + "SyN" en blanco. Se regeneran con el snippet de `sharp`
  del historial si cambia el diseño.

Si más adelante hay una versión vectorial oficial del logo, reemplazar el dibujo
de `Logo.tsx` y regenerar los PNG.
