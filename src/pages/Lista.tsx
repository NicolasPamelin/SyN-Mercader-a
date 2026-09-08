import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useDespensa } from '../context/DespensaContext'
import {
  CATEGORIAS,
  CATEGORIA_DEFAULT,
  formatCantidad,
  ordenCategoria,
} from '../lib/constants'
import type { ItemCompra } from '../lib/types'
import {
  IconBasura,
  IconCarrito,
  IconCheck,
  IconLista,
  IconMas,
  IconMenos,
} from '../components/iconos'
import { useToast } from '../components/ui/Toast'
import { Segmented } from '../components/ui/Segmented'
import { FotoTicketSheet } from '../components/FotoTicketSheet'
import { listItem, spring, tap } from '../lib/ui'

interface Fila {
  item: ItemCompra
  nombre: string
  categoria: string
  unidad: string
}

export function Lista() {
  const {
    hogar,
    productos,
    lista,
    agregarItemManual,
    toggleCarrito,
    cambiarCantidadItem,
    quitarItem,
    confirmarCompra,
  } = useDespensa()
  const toast = useToast()

  const [modoSuper, setModoSuper] = useState(false)
  const [texto, setTexto] = useState('')
  const [ticket, setTicket] = useState<{ id: string; count: number } | null>(
    null,
  )
  const [catSel, setCatSel] = useState<string>(() => {
    try {
      return localStorage.getItem('syn.cat_lista') || CATEGORIA_DEFAULT
    } catch {
      return CATEGORIA_DEFAULT
    }
  })
  const elegirCat = (c: string) => {
    setCatSel(c)
    try {
      localStorage.setItem('syn.cat_lista', c)
    } catch {
      /* noop */
    }
  }

  const prodPorId = useMemo(
    () => new Map(productos.map((p) => [p.id, p])),
    [productos],
  )

  const filas: Fila[] = useMemo(
    () =>
      lista.map((item) => {
        const p = item.producto_id ? prodPorId.get(item.producto_id) : undefined
        return {
          item,
          nombre: p?.nombre ?? item.nombre_libre ?? 'Item',
          categoria: p?.categoria ?? item.categoria ?? 'Almacén',
          unidad: p?.unidad ?? '',
        }
      }),
    [lista, prodPorId],
  )

  const grupos = useMemo(() => {
    const map = new Map<string, Fila[]>()
    for (const f of [...filas].sort(
      (a, b) =>
        (a.item.estado === 'en_carrito' ? 1 : 0) -
          (b.item.estado === 'en_carrito' ? 1 : 0) ||
        ordenCategoria(a.categoria) - ordenCategoria(b.categoria) ||
        a.nombre.localeCompare(b.nombre),
    )) {
      const arr = map.get(f.categoria) ?? []
      arr.push(f)
      map.set(f.categoria, arr)
    }
    return [...map.entries()].sort(
      (a, b) => ordenCategoria(a[0]) - ordenCategoria(b[0]),
    )
  }, [filas])

  const total = filas.length
  const enCarrito = filas.filter((f) => f.item.estado === 'en_carrito').length

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = texto.trim()
    if (!t) return
    const match = productos.find(
      (p) => p.nombre.toLowerCase() === t.toLowerCase(),
    )
    await agregarItemManual(
      match
        ? { productoId: match.id, cantidad: 1 }
        : { nombreLibre: t, cantidad: 1, categoria: catSel },
    )
    setTexto('')
  }

  const confirmar = async () => {
    const { count, compraId } = await confirmarCompra()
    tap(24)
    if (count === 0) {
      toast('No marcaste nada en el carrito', 'info')
      return
    }
    setModoSuper(false)
    if (compraId) setTicket({ id: compraId, count })
    else toast(`Sumé ${count} al stock`, 'ok')
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-[1.7rem]">Lista</h1>
        <span className="pb-1 text-xs text-ink-faint">
          {total === 0
            ? 'vacía'
            : `${total} ${total === 1 ? 'cosa' : 'cosas'}`}
        </span>
      </div>

      <div className="mb-4">
        <Segmented
          layoutId="lista-seg"
          value={modoSuper}
          onChange={setModoSuper}
          options={[
            {
              value: false,
              label: 'Planificar',
              icon: <IconLista width={15} height={15} />,
            },
            {
              value: true,
              label: 'En el super',
              icon: <IconCarrito width={15} height={15} />,
            },
          ]}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {!modoSuper ? (
          <motion.div
            key="alta"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4"
          >
            <form onSubmit={agregar} className="flex gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Agregar algo a la lista…"
                list="catalogo"
                className="input"
              />
              <datalist id="catalogo">
                {productos.map((p) => (
                  <option key={p.id} value={p.nombre} />
                ))}
              </datalist>
              <button
                type="submit"
                className="grid w-12 shrink-0 place-items-center rounded-xl bg-marca text-white shadow-soft"
                aria-label="Agregar"
              >
                <IconMas width={20} height={20} />
              </button>
            </form>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => elegirCat(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    catSel === c
                      ? 'bg-marca text-white'
                      : 'bg-surface-2 text-ink-soft'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progreso"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4"
          >
            <div className="mb-1.5 flex justify-between text-xs text-ink-faint">
              <span>En el carrito</span>
              <span className="tabular-nums">
                {enCarrito} / {total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.span
                className="block h-full rounded-full bg-marca"
                animate={{ width: total ? `${(enCarrito / total) * 100}%` : '0%' }}
                transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {total === 0 ? (
        <EstadoVacio />
      ) : (
        <div className="space-y-5">
          {grupos.map(([cat, fs]) => (
            <section key={cat}>
              <h2 className="eyebrow mb-2 px-1">{cat}</h2>
              <ul className="card divide-y divide-line overflow-hidden">
                <AnimatePresence initial={false}>
                  {fs.map((f) => (
                    <FilaItem
                      key={f.item.id}
                      fila={f}
                      modoSuper={modoSuper}
                      onToggle={() => {
                        tap()
                        toggleCarrito(f.item)
                      }}
                      onMas={() =>
                        cambiarCantidadItem(f.item.id, f.item.cantidad + 1)
                      }
                      onMenos={() =>
                        cambiarCantidadItem(f.item.id, f.item.cantidad - 1)
                      }
                      onQuitar={() => quitarItem(f.item.id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modoSuper ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={spring}
            className="safe-bottom fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md px-5"
          >
            <button
              type="button"
              onClick={confirmar}
              disabled={enCarrito === 0}
              className="btn-primary w-full py-3.5 shadow-lift"
            >
              Confirmar compra
              {enCarrito > 0 ? ` · ${enCarrito}` : ''} y reponer stock
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <FotoTicketSheet
        compraId={ticket?.id ?? null}
        hogarId={hogar?.id ?? ''}
        cantidad={ticket?.count ?? 0}
        onCerrar={() => setTicket(null)}
        onListo={() => toast('Compra guardada en el historial')}
      />
    </div>
  )
}

function FilaItem({
  fila,
  modoSuper,
  onToggle,
  onMas,
  onMenos,
  onQuitar,
}: {
  fila: Fila
  modoSuper: boolean
  onToggle: () => void
  onMas: () => void
  onMenos: () => void
  onQuitar: () => void
}) {
  const reduce = useReducedMotion()
  const { item, nombre, unidad } = fila
  const enCarrito = item.estado === 'en_carrito'

  return (
    <motion.li layout {...listItem} className="flex items-center gap-3 p-3">
      {modoSuper ? (
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.85 }}
          transition={spring}
          onClick={onToggle}
          aria-label={enCarrito ? 'Sacar del carrito' : 'Poner en el carrito'}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
            enCarrito
              ? 'border-marca bg-marca text-white'
              : 'border-line-strong text-transparent'
          }`}
        >
          <IconCheck width={15} height={15} />
        </motion.button>
      ) : null}

      <div
        className={`min-w-0 flex-1 transition-opacity ${
          enCarrito ? 'opacity-40' : ''
        }`}
      >
        <span
          className={`block truncate font-medium ${
            enCarrito ? 'line-through' : ''
          }`}
        >
          {nombre}
        </span>
        <span className="text-xs text-ink-faint">
          {formatCantidad(item.cantidad)} {unidad}
          {item.origen === 'auto' ? ' · automático' : ''}
        </span>
      </div>

      {!modoSuper ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMenos}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft active:bg-surface-2"
            aria-label="Menos"
          >
            <IconMenos width={15} height={15} />
          </button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">
            {formatCantidad(item.cantidad)}
          </span>
          <button
            type="button"
            onClick={onMas}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft active:bg-surface-2"
            aria-label="Más"
          >
            <IconMas width={15} height={15} />
          </button>
          <button
            type="button"
            onClick={onQuitar}
            className="ml-0.5 grid h-8 w-8 place-items-center rounded-full text-ink-faint active:bg-alerta-soft active:text-alerta"
            aria-label="Quitar"
          >
            <IconBasura width={15} height={15} />
          </button>
        </div>
      ) : null}
    </motion.li>
  )
}

function EstadoVacio() {
  return (
    <div className="mt-16 flex flex-col items-center px-6 text-center">
      <svg
        width="104"
        height="104"
        viewBox="0 0 104 104"
        fill="none"
        className="mb-5 text-marca"
      >
        <path
          d="M20 26h10l9 40h34l8-28H33"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="82" r="5" stroke="currentColor" strokeWidth="3" />
        <circle cx="72" cy="82" r="5" stroke="currentColor" strokeWidth="3" />
        <path
          d="M52 34v16M44 42h16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <h2 className="mb-1 text-lg">La lista está vacía</h2>
      <p className="max-w-[17rem] text-sm text-ink-soft">
        Cuando un producto baje de su mínimo aparece solo acá. También podés
        sumar cosas a mano.
      </p>
    </div>
  )
}
