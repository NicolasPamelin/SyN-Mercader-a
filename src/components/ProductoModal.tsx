import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CATEGORIAS, CATEGORIA_DEFAULT, UNIDADES } from '../lib/constants'
import type { Producto, Unidad } from '../lib/types'
import { spring } from '../lib/ui'
import { Segmented } from './ui/Segmented'
import { WheelPicker } from './ui/WheelPicker'

export interface DatosProducto {
  nombre: string
  categoria: string
  unidad: Unidad
  cantidad: number
  minimo: number
  paso: number
  esencial: boolean
}

interface Props {
  abierto: boolean
  inicial?: Producto | null
  nombreSugerido?: string
  onCerrar: () => void
  onGuardar: (d: DatosProducto) => void | Promise<void>
  onArchivar?: () => void | Promise<void>
}

export function ProductoModal({
  abierto,
  inicial,
  nombreSugerido,
  onCerrar,
  onGuardar,
  onArchivar,
}: Props) {
  const [d, setD] = useState<DatosProducto>(vacio())

  useEffect(() => {
    if (!abierto) return
    setD(
      inicial
        ? {
            nombre: inicial.nombre,
            categoria: inicial.categoria,
            unidad: inicial.unidad,
            cantidad: inicial.cantidad,
            minimo: inicial.minimo,
            paso: inicial.paso ?? 1,
            esencial: inicial.esencial,
          }
        : { ...vacio(), nombre: nombreSugerido ?? '' },
    )
  }, [abierto, inicial, nombreSugerido])

  const guardar = async () => {
    if (!d.nombre.trim()) return
    await onGuardar({ ...d, nombre: d.nombre.trim() })
    onCerrar()
  }

  return (
    <AnimatePresence>
      {abierto ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center"
          onClick={onCerrar}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className="safe-bottom flex max-h-[90svh] w-full max-w-md flex-col rounded-t-[1.75rem] border border-line bg-surface shadow-lift sm:rounded-[1.75rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden" />
            <h2 className="shrink-0 px-5 pb-3 pt-3 text-lg">
              {inicial ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 pb-2">
              <Campo label="Nombre">
                <input
                  value={d.nombre}
                  onChange={(e) => setD({ ...d, nombre: e.target.value })}
                  placeholder="Leche, fideos, lavandina…"
                  className="input"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Categoría">
                  <select
                    value={d.categoria}
                    onChange={(e) => setD({ ...d, categoria: e.target.value })}
                    className="input"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Unidad">
                  <select
                    value={d.unidad}
                    onChange={(e) =>
                      setD({ ...d, unidad: e.target.value as Unidad })
                    }
                    className="input"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </Campo>
              </div>

              <Campo label="Contar de a">
                <Segmented
                  layoutId="paso-seg"
                  value={d.paso}
                  onChange={(paso) =>
                    setD({
                      ...d,
                      paso,
                      cantidad:
                        paso === 1 ? Math.round(d.cantidad) : d.cantidad,
                      minimo: paso === 1 ? Math.round(d.minimo) : d.minimo,
                    })
                  }
                  options={[
                    { value: 1, label: '1 entero' },
                    { value: 0.5, label: '½ medio' },
                  ]}
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <WheelPicker
                  label="Tengo ahora"
                  value={d.cantidad}
                  step={d.paso}
                  max={60}
                  onChange={(cantidad) => setD({ ...d, cantidad })}
                />
                <WheelPicker
                  label="Mínimo"
                  value={d.minimo}
                  step={d.paso}
                  max={40}
                  onChange={(minimo) => setD({ ...d, minimo })}
                />
              </div>
              <p className="text-[11px] text-ink-faint">
                Cuando bajás del mínimo, el producto salta solo a la lista.
              </p>

              <button
                type="button"
                onClick={() => setD({ ...d, esencial: !d.esencial })}
                className="flex w-full items-center gap-3 rounded-xl bg-surface-2 p-3 text-left"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                    d.esencial
                      ? 'border-marca bg-marca text-white'
                      : 'border-line-strong text-transparent'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm">
                  <b>Esencial.</b>{' '}
                  <span className="text-ink-soft">Nunca puede faltar en casa.</span>
                </span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
              {inicial && onArchivar ? (
                <button
                  type="button"
                  onClick={onArchivar}
                  className="rounded-xl px-2 py-3 text-sm font-medium text-alerta"
                >
                  Eliminar
                </button>
              ) : null}
              <button
                type="button"
                onClick={onCerrar}
                className="ml-auto rounded-xl px-4 py-3 text-sm font-medium text-ink-soft"
              >
                Cancelar
              </button>
              <button type="button" onClick={guardar} className="btn-primary">
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function Campo({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  )
}

function vacio(): DatosProducto {
  return {
    nombre: '',
    categoria: CATEGORIA_DEFAULT,
    unidad: 'unidad',
    cantidad: 1,
    minimo: 1,
    paso: 1,
    esencial: false,
  }
}
