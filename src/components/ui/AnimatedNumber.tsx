import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

interface Props {
  value: number
  format: (n: number) => string
  className?: string
}

/** Muestra un número que se desliza cuando cambia. */
export function AnimatedNumber({ value, format, className }: Props) {
  const reduce = useReducedMotion()
  const texto = format(value)

  if (reduce) return <span className={className}>{texto}</span>

  return (
    <span className={`relative inline-grid ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={texto}
          initial={{ y: '55%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-55%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
          className="col-start-1 row-start-1 tabular-nums"
        >
          {texto}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
