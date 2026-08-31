import { IconMas, IconMenos } from './iconos'

interface Props {
  valor: number
  unidad?: string
  paso?: number
  onMenos: () => void
  onMas: () => void
  onFijar?: (v: number) => void
  bajo?: boolean
}

export function Stepper({
  valor,
  unidad,
  paso = 1,
  onMenos,
  onMas,
  onFijar,
  bajo,
}: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onMenos}
        aria-label="Restar"
        className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-700 active:scale-95 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"
        disabled={valor <= 0}
      >
        <IconMenos width={20} height={20} />
      </button>

      <label className="flex min-w-[3.5rem] flex-col items-center">
        <input
          type="number"
          inputMode="decimal"
          value={Number.isInteger(valor) ? valor : valor.toFixed(2)}
          onChange={(e) => onFijar?.(Number(e.target.value))}
          readOnly={!onFijar}
          className={`w-16 rounded-lg bg-transparent text-center text-lg font-semibold tabular-nums outline-none ${
            bajo ? 'text-rose-600 dark:text-rose-400' : ''
          }`}
        />
        {unidad ? (
          <span className="text-[11px] leading-none text-slate-400">{unidad}</span>
        ) : null}
      </label>

      <button
        type="button"
        onClick={onMas}
        aria-label="Sumar"
        className="grid h-11 w-11 place-items-center rounded-full bg-marca-600 text-white active:scale-95"
      >
        <IconMas width={20} height={20} />
      </button>
      {paso !== 1 ? <span className="sr-only">paso {paso}</span> : null}
    </div>
  )
}
