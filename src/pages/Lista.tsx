import { useMemo, useState } from 'react'
import { useDespensa } from '../context/DespensaContext'
import { ordenCategoria } from '../lib/constants'
import type { ItemCompra } from '../lib/types'
import { IconCheck, IconMas, IconMenos, IconBasura } from '../components/iconos'

interface Fila {
  item: ItemCompra
  nombre: string
  categoria: string
  unidad: string
}

export function Lista() {
  const {
    productos,
    lista,
    agregarItemManual,
    toggleCarrito,
    cambiarCantidadItem,
    quitarItem,
    confirmarCompra,
  } = useDespensa()

  const [modoSuper, setModoSuper] = useState(false)
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  const prodPorId = useMemo(
    () => new Map(productos.map((p) => [p.id, p])),
    [productos],
  )

  const filas: Fila[] = useMemo(() => {
    return lista.map((item) => {
      const p = item.producto_id ? prodPorId.get(item.producto_id) : undefined
      return {
        item,
        nombre: p?.nombre ?? item.nombre_libre ?? 'Item',
        categoria: p?.categoria ?? 'General',
        unidad: p?.unidad ?? '',
      }
    })
  }, [lista, prodPorId])

  const grupos = useMemo(() => {
    const orden = (f: Fila) =>
      (f.item.estado === 'en_carrito' ? 1000 : 0) + ordenCategoria(f.categoria)
    const map = new Map<string, Fila[]>()
    for (const f of [...filas].sort((a, b) => orden(a) - orden(b))) {
      const arr = map.get(f.categoria) ?? []
      arr.push(f)
      map.set(f.categoria, arr)
    }
    return [...map.entries()].sort(
      (a, b) => ordenCategoria(a[0]) - ordenCategoria(b[0]),
    )
  }, [filas])

  const enCarrito = filas.filter((f) => f.item.estado === 'en_carrito').length

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = texto.trim()
    if (!t) return
    const match = productos.find((p) => p.nombre.toLowerCase() === t.toLowerCase())
    await agregarItemManual(
      match ? { productoId: match.id, cantidad: 1 } : { nombreLibre: t, cantidad: 1 },
    )
    setTexto('')
  }

  const confirmar = async () => {
    const n = await confirmarCompra()
    setAviso(
      n > 0
        ? `Listo. Sumé ${n} ${n === 1 ? 'producto' : 'productos'} al stock.`
        : 'No marcaste nada en el carrito.',
    )
    setModoSuper(false)
    setTimeout(() => setAviso(null), 3500)
  }

  return (
    <div>
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lista</h1>
        <button
          type="button"
          onClick={() => setModoSuper((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            modoSuper
              ? 'bg-marca-600 text-white'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {modoSuper ? 'En el super' : 'Modo super'}
        </button>
      </header>

      {aviso ? (
        <p className="mb-3 rounded-xl bg-marca-100 px-3 py-2 text-sm text-marca-800">
          {aviso}
        </p>
      ) : null}

      {!modoSuper ? (
        <form onSubmit={agregar} className="mb-4 flex gap-2">
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
            className="grid w-12 shrink-0 place-items-center rounded-xl bg-marca-600 text-white"
            aria-label="Agregar"
          >
            <IconMas width={20} height={20} />
          </button>
        </form>
      ) : null}

      {filas.length === 0 ? (
        <p className="mt-16 text-center text-sm text-slate-500">
          La lista está vacía. Cuando algo baje del mínimo aparece solo acá.
        </p>
      ) : (
        <div className="space-y-4">
          {grupos.map(([cat, fs]) => (
            <section key={cat}>
              <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {cat}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white dark:divide-slate-800 dark:bg-slate-900">
                {fs.map((f) => (
                  <FilaItem
                    key={f.item.id}
                    fila={f}
                    modoSuper={modoSuper}
                    onToggle={() => toggleCarrito(f.item)}
                    onMas={() => cambiarCantidadItem(f.item.id, f.item.cantidad + 1)}
                    onMenos={() =>
                      cambiarCantidadItem(f.item.id, f.item.cantidad - 1)
                    }
                    onQuitar={() => quitarItem(f.item.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {modoSuper ? (
        <div className="safe-bottom fixed inset-x-0 bottom-16 z-20 mx-auto max-w-md px-4">
          <button
            type="button"
            onClick={confirmar}
            disabled={enCarrito === 0}
            className="w-full rounded-2xl bg-marca-600 py-3.5 font-semibold text-white shadow-lg disabled:opacity-50"
          >
            Confirmar compra ({enCarrito}) y reponer stock
          </button>
        </div>
      ) : null}
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
  const { item, nombre, unidad } = fila
  const enCarrito = item.estado === 'en_carrito'

  return (
    <li className="flex items-center gap-3 p-3">
      {modoSuper ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={enCarrito ? 'Sacar del carrito' : 'Poner en el carrito'}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
            enCarrito
              ? 'border-marca-600 bg-marca-600 text-white'
              : 'border-slate-300 text-transparent'
          }`}
        >
          <IconCheck width={16} height={16} />
        </button>
      ) : null}

      <div className={`min-w-0 flex-1 ${enCarrito ? 'opacity-40 line-through' : ''}`}>
        <span className="block truncate font-medium">{nombre}</span>
        <span className="text-xs text-slate-400">
          {item.cantidad} {unidad}
          {item.origen === 'auto' ? ' · automático' : ''}
        </span>
      </div>

      {!modoSuper ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMenos}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
            aria-label="Menos"
          >
            <IconMenos width={16} height={16} />
          </button>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">
            {item.cantidad}
          </span>
          <button
            type="button"
            onClick={onMas}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
            aria-label="Más"
          >
            <IconMas width={16} height={16} />
          </button>
          <button
            type="button"
            onClick={onQuitar}
            className="ml-1 grid h-8 w-8 place-items-center rounded-full text-slate-300"
            aria-label="Quitar"
          >
            <IconBasura width={16} height={16} />
          </button>
        </div>
      ) : null}
    </li>
  )
}
