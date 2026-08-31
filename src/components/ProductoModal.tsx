import { useEffect, useState } from 'react'
import { CATEGORIAS, UNIDADES } from '../lib/constants'
import type { Producto, Unidad } from '../lib/types'

export interface DatosProducto {
  nombre: string
  categoria: string
  unidad: Unidad
  cantidad: number
  minimo: number
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
    if (inicial) {
      setD({
        nombre: inicial.nombre,
        categoria: inicial.categoria,
        unidad: inicial.unidad,
        cantidad: inicial.cantidad,
        minimo: inicial.minimo,
        esencial: inicial.esencial,
      })
    } else {
      setD({ ...vacio(), nombre: nombreSugerido ?? '' })
    }
  }, [abierto, inicial, nombreSugerido])

  if (!abierto) return null

  const guardar = async () => {
    if (!d.nombre.trim()) return
    await onGuardar({ ...d, nombre: d.nombre.trim() })
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onCerrar}
    >
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {inicial ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <div className="space-y-3">
          <Campo label="Nombre">
            <input
              autoFocus={!inicial}
              value={d.nombre}
              onChange={(e) => setD({ ...d, nombre: e.target.value })}
              placeholder="Leche, fideos, lavandina…"
              className="input"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Categoría (góndola)">
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
                onChange={(e) => setD({ ...d, unidad: e.target.value as Unidad })}
                className="input"
              >
                {UNIDADES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Tengo ahora">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={d.cantidad}
                onChange={(e) => setD({ ...d, cantidad: Number(e.target.value) })}
                className="input"
              />
            </Campo>
            <Campo label="Mínimo (avisa cuando baja de acá)">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={d.minimo}
                onChange={(e) => setD({ ...d, minimo: Number(e.target.value) })}
                className="input"
              />
            </Campo>
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <input
              type="checkbox"
              checked={d.esencial}
              onChange={(e) => setD({ ...d, esencial: e.target.checked })}
              className="h-5 w-5 accent-marca-600"
            />
            <span className="text-sm">
              <b>Esencial.</b> Nunca puede faltar en casa.
            </span>
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          {inicial && onArchivar ? (
            <button
              type="button"
              onClick={onArchivar}
              className="rounded-xl px-3 py-3 text-sm font-medium text-rose-600"
            >
              Eliminar
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCerrar}
            className="ml-auto rounded-xl px-4 py-3 text-sm font-medium text-slate-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            className="rounded-xl bg-marca-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function vacio(): DatosProducto {
  return {
    nombre: '',
    categoria: 'Almacén',
    unidad: 'unidad',
    cantidad: 1,
    minimo: 1,
    esencial: false,
  }
}
