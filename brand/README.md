# Marca

- `SyN_Logo.jpeg` — primer logo (aro + casa + SyN). Referencia.
- `SyN_2.png` — segundo logo (aro neón + carrito 3D + SyN). Referencia.
- `Carrito_1.png` — carrito 3D cromado. Referencia de silueta (canasto con rejilla).

Ninguno de los dos se usa directo en la app: son estilo 3D / neón, no rinden a
tamaño chico y el celeste choca con la paleta cálida. Se toma el **concepto** y
se redibuja plano.

Versión vigente: **carrito de super dentro de un aro doble verde** (del segundo
logo). Sin texto dentro del emblema — "SyN Mercadería" va como texto al lado.

- **En pantalla:** `src/components/Logo.tsx` (`LogoMark`) — theme-aware, nítido a
  cualquier tamaño. Barra, login y splash.
- **Ícono app / favicon:** `public/favicon.svg` + `icon-192/512/maskable` +
  `apple-touch-icon` — carrito blanco sobre tile verde. Se regeneran con el
  snippet de `sharp` del historial.

Si aparece un logo vectorial oficial, reemplazar el dibujo de `Logo.tsx` y
regenerar los PNG.
