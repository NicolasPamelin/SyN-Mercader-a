// Vibración corta en el celu para las acciones táctiles (sumar, tildar, confirmar).
// En desktop o navegadores sin soporte no hace nada.
export function tap(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* no-op */
  }
}

export const spring = { type: 'spring', stiffness: 460, damping: 32, mass: 0.7 } as const

export const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
  transition: spring,
}
