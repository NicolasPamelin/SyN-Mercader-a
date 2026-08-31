import { useMemo, useState } from 'react'
import { useDespensa } from '../context/DespensaContext'
import { formatCantidad, ordenCategoria } from '../lib/constants'
import type { Producto } from '../lib/types'
import { Stepper } from '../components/Stepper'
import { ProductoModal, type DatosProducto } from '../components/ProductoModal'
import { IconBuscar, IconEstrella, IconMas } from '../components/iconos'

export function Stock() {
  const {
    productos,
    agregarProducto,
    editarProducto,
    archivarProducto,
    ajustarCantidad,
    fijarCantidad,
  } = useDespensa()

  const [q, setQ] = useState('')
  const [modal, setModal] = useState<{ abierto: boolean; prod: Producto | null }>({
    abierto: false,
    prod: null,
  })

  const filtro = q.trim().toLowerCase()

  const grupos = useMemo(() => {
    const vis = productos.filter((p) =>
      filtro ? p.nombre.toLowerCase().includes(filtro) : true,
    )
    const map = new Map<string, Producto[]>()
    for (const p of vis) {
      const arr = map.get(p.categoria) ?? []
      arr.push(p)
      map.set(p.categoria, arr)
    }
    return [...map.entries()].sort(
      (a, b) => ordenCategoria(a[0]) - ordenCategoria(b[0]),
    )
  }, [productos, filtro])

  const hayExacto = productos.some((p) => p.nombre.toLowerCase() === filtro)
  const bajos = productos.filter((p) => p.minimo > 0 && p.cantidad <= p.minimo).length

  const guardar = async (d: DatosProducto) => {
    if (modal.prod) await editarProducto(modal.prod.id, d)
    else await agregarProducto(d)
  }

  return (
    <div>
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Despensa</h1>
        <span className="text-xs text-slate-400">
          {productos.length} productos
          {bajos > 0 ? ` · ${bajos} en falta` : ''}
        </span>
      </header>

      <div className="sticky top-0 z-10 -mx-4 mb-3 bg-slate-50 px-4 py-2 dark:bg-slate-950">
        <div className="relative">
          <IconBuscar
            width={18}
            height={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar o agregar producto…"
            className="input pl-9"
          />
        </div>

        {filtro && !hayExacto ? (
          <button
            type="button"
            onClick={() => setModal({ abierto: true, prod: null })}
            className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-marca-500 px-3 py-2.5 text-sm font-medium text-marca-700 dark:text-marca-500"
          >
            <IconMas width={16} height={16} />
            Agregar “{q.trim()}” al catálogo
          </button>
        ) : null}
      </div>

      {productos.length === 0 ? (
        <EstadoVacio onNuevo={() => setModal({ abierto: true, prod: null })} />
      ) : (
        <div className="space-y-5">
          {grupos.map(([cat, items]) => (
            <section key={cat}>
              <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {cat}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-900">
                {items.map((p) => {
                  const bajo = p.minimo > 0 && p.cantidad <= p.minimo
                  return (
                    <li key={p.id} className="flex items-center gap-2 p-2.5">
                      <button
                        type="button"
                        onClick={() => setModal({ abierto: true, prod: p })}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          {p.esencial ? (
                            <IconEstrella
                              width={13}
                              height={13}
                              className="shrink-0 text-amber-400"
                              fill="currentColor"
                            />
                          ) : null}
                          <span className="truncate font-medium">{p.nombre}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {bajo ? 'En falta · ' : ''}mín. {formatCantidad(p.minimo)}{' '}
                          {p.unidad}
                        </span>
                      </button>
                      <Stepper
                        valor={p.cantidad}
                        unidad={p.unidad}
                        paso={p.paso ?? 1}
                        bajo={bajo}
                        onMenos={() => ajustarCantidad(p.id, -(p.paso ?? 1))}
                        onMas={() => ajustarCantidad(p.id, p.paso ?? 1)}
                        onFijar={(v) => fijarCantidad(p.id, v)}
                      />
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ProductoModal
        abierto={modal.abierto}
        inicial={modal.prod}
        nombreSugerido={q.trim()}
        onCerrar={() => {
          setModal({ abierto: false, prod: null })
          setQ('')
        }}
        onGuardar={guardar}
        onArchivar={
          modal.prod
            ? async () => {
                await archivarProducto(modal.prod!.id)
                setModal({ abierto: false, prod: null })
              }
            : undefined
        }
      />
    </div>
  )
}

function EstadoVacio({ onNuevo }: { onNuevo: () => void }) {
  return (
    <div className="mt-16 text-center">
      <p className="mb-1 font-medium">Todavía no cargaste nada</p>
      <p className="mb-4 text-sm text-slate-500">
        Empezá por lo esencial: leche, pan, fideos, papel, lo que nunca puede
        faltar.
      </p>
      <button
        type="button"
        onClick={onNuevo}
        className="rounded-xl bg-marca-600 px-5 py-3 font-semibold text-white"
      >
        Cargar el primero
      </button>
    </div>
  )
}
