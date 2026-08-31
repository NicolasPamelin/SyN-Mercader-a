import { useEffect, useMemo, useRef } from 'react'
import { formatCantidad } from '../../lib/constants'
import { tap } from '../../lib/ui'

const ROW = 34
const VISIBLE = 5 // filas visibles (impar: hay una central)
const H = ROW * VISIBLE
const PAD = (H - ROW) / 2

interface Props {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  format?: (n: number) => string
  label?: string
}

/** Selector tipo ruedita (estilo alarma de iPhone). Snap + vibración por paso. */
export function WheelPicker({
  value,
  onChange,
  min = 0,
  max = 50,
  step = 1,
  format = formatCantidad,
  label,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastIdx = useRef(-1)
  const scrolling = useRef(false)

  const items = useMemo(() => {
    const out: number[] = []
    for (let v = min; v <= max + 1e-9; v += step) {
      out.push(Math.round(v * 1000) / 1000)
    }
    return out
  }, [min, max, step])

  const idxOf = (v: number) => {
    const i = Math.round((v - min) / step)
    return Math.max(0, Math.min(items.length - 1, i))
  }

  // sincroniza el scroll cuando cambia el valor desde afuera
  useEffect(() => {
    const el = ref.current
    if (!el || scrolling.current) return
    const target = idxOf(value) * ROW
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items])

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    scrolling.current = true
    const idx = Math.max(
      0,
      Math.min(items.length - 1, Math.round(el.scrollTop / ROW)),
    )
    if (idx !== lastIdx.current) {
      lastIdx.current = idx
      tap(5)
    }
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      scrolling.current = false
      const i = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ROW)),
      )
      if (Math.abs(el.scrollTop - i * ROW) > 2) {
        el.scrollTo({ top: i * ROW, behavior: 'smooth' })
      }
      if (items[i] !== value) onChange(items[i])
    }, 140)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {label ? (
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </span>
      ) : null}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-line bg-surface-2"
        style={{ height: H }}
      >
        {/* banda de selección */}
        <div
          className="pointer-events-none absolute inset-x-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-marca-soft ring-1 ring-marca/25"
          style={{ height: ROW }}
        />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="wheel-scroll h-full snap-y snap-mandatory overflow-y-scroll"
          style={{ paddingTop: PAD, paddingBottom: PAD }}
        >
          {items.map((n) => {
            const sel = Math.abs(n - value) < 1e-9
            return (
              <div
                key={n}
                className={`flex snap-center items-center justify-center tabular-nums transition-[color,transform] ${
                  sel
                    ? 'scale-105 font-bold text-marca-ink'
                    : 'text-ink-faint'
                }`}
                style={{ height: ROW }}
              >
                {format(n)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
