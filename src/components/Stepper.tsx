import { motion, useReducedMotion } from 'motion/react'
import { IconMas, IconMenos } from './iconos'
import { AnimatedNumber } from './ui/AnimatedNumber'
import { formatCantidad } from '../lib/constants'
import { spring, tap } from '../lib/ui'

interface Props {
  valor: number
  unidad?: string
  onMenos: () => void
  onMas: () => void
  bajo?: boolean
  size?: 'md' | 'sm'
}

export function Stepper({ valor, unidad, onMenos, onMas, bajo, size = 'md' }: Props) {
  const reduce = useReducedMotion()
  const press = reduce ? undefined : { scale: 0.84 }
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const icon = size === 'sm' ? 15 : 18

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-surface-2 p-1">
      <motion.button
        type="button"
        whileTap={press}
        transition={spring}
        onClick={() => {
          tap()
          onMenos()
        }}
        aria-label="Restar"
        disabled={valor <= 0}
        className={`grid ${btn} place-items-center rounded-full text-ink-soft transition-colors active:bg-surface disabled:opacity-30`}
      >
        <IconMenos width={icon} height={icon} />
      </motion.button>

      <div
        className={`flex flex-col items-center leading-none ${
          size === 'sm' ? 'min-w-[1.75rem]' : 'min-w-[2.75rem]'
        }`}
      >
        <AnimatedNumber
          value={valor}
          format={formatCantidad}
          className={`font-semibold ${size === 'sm' ? 'text-base' : 'text-[1.15rem]'} ${
            bajo ? 'text-alerta' : 'text-ink'
          }`}
        />
        {unidad && size !== 'sm' ? (
          <span className="mt-0.5 text-[10px] font-medium text-ink-faint">
            {unidad}
          </span>
        ) : null}
      </div>

      <motion.button
        type="button"
        whileTap={press}
        transition={spring}
        onClick={() => {
          tap()
          onMas()
        }}
        aria-label="Sumar"
        className={`grid ${btn} place-items-center rounded-full bg-marca text-white shadow-soft`}
      >
        <IconMas width={icon} height={icon} />
      </motion.button>
    </div>
  )
}
