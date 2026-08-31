import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { spring, tap } from '../../lib/ui'

export interface SegOption<T> {
  value: T
  label: string
  icon?: ReactNode
}

interface Props<T extends string | number | boolean> {
  value: T
  onChange: (v: T) => void
  options: SegOption<T>[]
  /** id único para la animación del selector deslizante */
  layoutId: string
  variant?: 'solid' | 'soft'
}

/** Selector tipo interruptor: el elegido queda marcado con una pastilla llena. */
export function Segmented<T extends string | number | boolean>({
  value,
  onChange,
  options,
  layoutId,
  variant = 'solid',
}: Props<T>) {
  const solid = variant === 'solid'
  return (
    <div className="relative flex gap-1 rounded-full border border-line bg-surface-2 p-1">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (!active) {
                tap()
                onChange(o.value)
              }
            }}
            className="relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold"
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className={`absolute inset-0 rounded-full ${
                  solid
                    ? 'bg-marca shadow-[0_1px_3px_rgba(15,118,110,0.45),0_5px_14px_rgba(15,118,110,0.3)]'
                    : 'bg-surface shadow-soft ring-1 ring-line'
                }`}
              />
            ) : null}
            <span
              className={`relative flex items-center gap-1.5 ${
                active
                  ? solid
                    ? 'text-white'
                    : 'text-ink'
                  : 'text-ink-faint'
              }`}
            >
              {o.icon}
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
