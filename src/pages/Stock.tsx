import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useDespensa } from '../context/DespensaContext'
import { formatCantidad, ordenCategoria } from '../lib/constants'
import type { Producto } from '../lib/types'
import { Stepper } from '../components/Stepper'
import { ProductoModal, type DatosProducto } from '../components/ProductoModal'
import { IconBuscar, IconEstrella, IconMas } from '../components/iconos'
import { useToast } from '../components/ui/Toast'
import { listItem } from '../lib/ui'

export function Stock() {
  const {
    productos,
    agregarProducto,
    editarProducto,
    archivarProducto,
    ajustarCantidad,
  } = useDespensa()
  const toast = useToast()

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
  const bajos = productos.filter(
    (p) => p.minimo > 0 && p.cantidad <= p.minimo,
  ).length

  const guardar = async (d: DatosProducto) => {
    if (modal.prod) {
      await editarProducto(modal.prod.id, d)
      toast('Producto actualizado')
    } else {
      await agregarProducto(d)
      toast(`${d.nombre} está en la despensa`)
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <h1 className="text-[1.7rem]">Despensa</h1>
        <span className="pb-1 text-xs text-ink-faint">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
          {bajos > 0 ? (
            <span className="text-alerta"> · {bajos} en falta</span>
          ) : null}
        </span>
      </div>

      <div className="sticky top-[57px] z-10 -mx-5 mb-4 bg-bg/85 px-5 py-2 backdrop-blur-md">
        <div className="relative">
          <IconBuscar
            width={17}
            height={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar o agregar…"
            className="input pl-10"
          />
        </div>

        <AnimatePresence>
          {filtro && !hayExacto ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onClick={() => {
                // cerrar el teclado para ver el panel completo
                ;(document.activeElement as HTMLElement | null)?.blur()
                setModal({ abierto: true, prod: null })
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-marca px-3 py-2.5 text-sm font-semibold text-marca-ink"
            >
              <IconMas width={16} height={16} />
              Agregar “{q.trim()}”
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {productos.length === 0 ? (
        <EstadoVacio onNuevo={() => setModal({ abierto: true, prod: null })} />
      ) : grupos.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-soft">
          Nada con ese nombre. Podés agregarlo desde el botón de arriba.
        </p>
      ) : (
        <div className="space-y-6">
          {grupos.map(([cat, items]) => (
            <section key={cat}>
              <h2 className="eyebrow mb-2 px-1">{cat}</h2>
              <ul className="card divide-y divide-line overflow-hidden">
                <AnimatePresence initial={false}>
                  {items.map((p) => (
                    <ProductoFila
                      key={p.id}
                      p={p}
                      onEditar={() => setModal({ abierto: true, prod: p })}
                      onMenos={() => ajustarCantidad(p.id, -(p.paso ?? 1))}
                      onMas={() => ajustarCantidad(p.id, p.paso ?? 1)}
                    />
                  ))}
                </AnimatePresence>
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
                const nombre = modal.prod!.nombre
                await archivarProducto(modal.prod!.id)
                setModal({ abierto: false, prod: null })
                toast(`${nombre} eliminado`, 'info')
              }
            : undefined
        }
      />
    </div>
  )
}

function ProductoFila({
  p,
  onEditar,
  onMenos,
  onMas,
}: {
  p: Producto
  onEditar: () => void
  onMenos: () => void
  onMas: () => void
}) {
  const bajo = p.minimo > 0 && p.cantidad <= p.minimo
  const objetivo = p.minimo > 0 ? p.minimo * 2 : Math.max(p.cantidad, 1)
  const pct = Math.max(0, Math.min(1, p.cantidad / objetivo))

  return (
    <motion.li layout {...listItem} className="p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEditar}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-center gap-1.5">
            {p.esencial ? (
              <IconEstrella
                width={12}
                height={12}
                className="shrink-0 text-marca"
                fill="currentColor"
              />
            ) : null}
            <span className="truncate font-medium">{p.nombre}</span>
          </span>
          <span
            className={`text-xs ${bajo ? 'text-alerta' : 'text-ink-faint'}`}
          >
            {bajo ? 'Reponer' : 'En casa'} · mín. {formatCantidad(p.minimo)}{' '}
            {p.unidad}
          </span>
        </button>
        <Stepper
          valor={p.cantidad}
          unidad={p.unidad}
          bajo={bajo}
          onMenos={onMenos}
          onMas={onMas}
        />
      </div>

      <div className="relative mt-2.5 h-1 overflow-hidden rounded-full bg-surface-2">
        <motion.span
          className={`absolute inset-y-0 left-0 rounded-full ${
            bajo ? 'bg-alerta' : 'bg-marca'
          }`}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 240, damping: 30 }}
        />
        {p.minimo > 0 ? (
          <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
        ) : null}
      </div>
    </motion.li>
  )
}

function EstadoVacio({ onNuevo }: { onNuevo: () => void }) {
  return (
    <div className="mt-14 flex flex-col items-center px-6 text-center">
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        className="mb-5 text-marca"
      >
        <rect
          x="22"
          y="30"
          width="68"
          height="66"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.35"
        />
        <path
          d="M22 50h68M22 72h68M46 30v66"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.35"
        />
        <path
          d="M38 16h36l-4 14H42l-4-14Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <h2 className="mb-1 text-lg">Tu despensa está vacía</h2>
      <p className="mb-5 max-w-[16rem] text-sm text-ink-soft">
        Empezá por lo que nunca puede faltar: leche, pan, fideos, papel.
      </p>
      <button type="button" onClick={onNuevo} className="btn-primary">
        Cargar el primero
      </button>
    </div>
  )
}
