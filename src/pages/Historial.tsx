import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { useDespensa } from '../context/DespensaContext'
import type { Compra } from '../lib/types'
import { formatCantidad } from '../lib/constants'
import { borrarTicket, subirTicket, urlTicket } from '../lib/tickets'
import { IconCamara, IconTicket } from '../components/iconos'
import { useToast } from '../components/ui/Toast'
import { spring, tap } from '../lib/ui'

const fmtFecha = (f: string, largo = false) => {
  const d = new Date(f + 'T00:00:00')
  const s = d.toLocaleDateString('es-AR', {
    weekday: largo ? 'long' : 'short',
    day: 'numeric',
    month: largo ? 'long' : 'short',
    year: largo ? 'numeric' : undefined,
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const fmtPesos = (n: number) =>
  '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 })

export function Historial() {
  const { hogar } = useDespensa()
  const toast = useToast()
  const [compras, setCompras] = useState<Compra[]>([])
  const [cargando, setCargando] = useState(true)
  const [sel, setSel] = useState<Compra | null>(null)

  const cargar = useCallback(async () => {
    if (!hogar) return
    setCargando(true)
    const { data } = await supabase
      .from('compras')
      .select('*')
      .eq('hogar_id', hogar.id)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
    setCompras((data as Compra[]) ?? [])
    setCargando(false)
  }, [hogar])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const meses = useMemo(() => {
    const map = new Map<string, Compra[]>()
    for (const c of compras) {
      const d = new Date(c.fecha + 'T00:00:00')
      const k = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      const arr = map.get(k) ?? []
      arr.push(c)
      map.set(k, arr)
    }
    return [...map.entries()]
  }, [compras])

  return (
    <div>
      <h1 className="mb-4 text-[1.7rem]">Historial</h1>

      {cargando ? (
        <p className="mt-16 text-center text-sm text-ink-faint">Cargando…</p>
      ) : compras.length === 0 ? (
        <div className="mt-16 flex flex-col items-center px-6 text-center">
          <IconTicket width={64} height={64} className="mb-4 text-marca opacity-40" />
          <h2 className="mb-1 text-lg">Todavía no hay compras</h2>
          <p className="max-w-[17rem] text-sm text-ink-soft">
            Cuando confirmes una compra desde la lista, queda guardada acá con lo
            que llevaste y, si querés, la foto del ticket.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {meses.map(([mes, cs]) => (
            <section key={mes}>
              <h2 className="eyebrow mb-2 px-1">{mes}</h2>
              <ul className="card divide-y divide-line overflow-hidden">
                {cs.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSel(c)}
                      className="flex w-full items-center gap-3 p-3 text-left"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-soft">
                        <IconTicket width={18} height={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {fmtFecha(c.fecha)}
                        </span>
                        <span className="text-xs text-ink-faint">
                          {c.mercado ? `${c.mercado} · ` : ''}
                          {c.cant_items}{' '}
                          {c.cant_items === 1 ? 'producto' : 'productos'}
                          {c.foto_path ? ' · con ticket' : ''}
                        </span>
                      </span>
                      {c.total != null ? (
                        <span className="text-sm font-semibold tabular-nums">
                          {fmtPesos(c.total)}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <DetalleCompra
        compra={sel}
        hogarId={hogar?.id ?? ''}
        onCerrar={() => setSel(null)}
        onCambio={() => {
          void cargar()
        }}
        onEliminada={() => {
          setSel(null)
          void cargar()
          toast('Compra eliminada', 'info')
        }}
      />
    </div>
  )
}

function DetalleCompra({
  compra,
  hogarId,
  onCerrar,
  onCambio,
  onEliminada,
}: {
  compra: Compra | null
  hogarId: string
  onCerrar: () => void
  onCambio: () => void
  onEliminada: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [mercado, setMercado] = useState('')
  const [total, setTotal] = useState('')

  useEffect(() => {
    setFotoUrl(null)
    if (compra?.foto_path) void urlTicket(compra.foto_path).then(setFotoUrl)
  }, [compra?.id, compra?.foto_path])

  useEffect(() => {
    setMercado(compra?.mercado ?? '')
    setTotal(compra?.total != null ? String(compra.total) : '')
  }, [compra?.id, compra?.mercado, compra?.total])

  const guardarCampo = async (campo: 'mercado' | 'total', valor: string) => {
    if (!compra) return
    let v: string | number | null = valor.trim() || null
    if (campo === 'total') {
      const n = Number(valor.replace(',', '.').replace(/[^0-9.]/g, ''))
      v = valor.trim() && !Number.isNaN(n) ? n : null
    }
    await supabase.from('compras').update({ [campo]: v }).eq('id', compra.id)
    onCambio()
  }

  const subir = async (file: File) => {
    if (!compra) return
    setSubiendo(true)
    try {
      await subirTicket(hogarId, compra.id, file)
      onCambio()
      const nueva = await urlTicket(`${hogarId}/${compra.id}.jpg`)
      setFotoUrl(nueva ? `${nueva}&t=${Date.now()}` : null)
    } finally {
      setSubiendo(false)
    }
  }

  const eliminar = async () => {
    if (!compra) return
    if (compra.foto_path) await borrarTicket(compra.id, compra.foto_path)
    await supabase.from('compras').delete().eq('id', compra.id)
    onEliminada()
  }

  return (
    <AnimatePresence>
      {compra ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="safe-bottom flex max-h-[90svh] w-full max-w-md flex-col rounded-t-[1.75rem] border border-line bg-surface shadow-lift sm:rounded-[1.75rem]"
          >
            <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden" />
            <div className="shrink-0 px-5 pb-3 pt-3">
              <h2 className="text-lg">{fmtFecha(compra.fecha, true)}</h2>
              <p className="text-xs text-ink-soft">
                {compra.mercado ? `${compra.mercado} · ` : ''}
                {compra.cant_items}{' '}
                {compra.cant_items === 1 ? 'producto' : 'productos'}
                {compra.total != null ? ` · ${fmtPesos(compra.total)}` : ''}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Supermercado
                  </span>
                  <input
                    value={mercado}
                    onChange={(e) => setMercado(e.target.value)}
                    onBlur={() => guardarCampo('mercado', mercado)}
                    placeholder="—"
                    className="input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Total
                  </span>
                  <input
                    inputMode="decimal"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    onBlur={() => guardarCampo('total', total)}
                    placeholder="$"
                    className="input"
                  />
                </label>
              </div>

              <ul className="card divide-y divide-line overflow-hidden">
                {compra.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2.5 text-sm"
                  >
                    <span>{it.nombre}</span>
                    <span className="text-ink-faint">
                      {formatCantidad(it.cantidad)} {it.unidad}
                    </span>
                  </li>
                ))}
              </ul>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void subir(f)
                }}
              />

              {compra.foto_path ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="block w-full overflow-hidden rounded-xl border border-line"
                >
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt="Ticket"
                      className="max-h-[60vh] w-full bg-surface-2 object-contain"
                    />
                  ) : (
                    <div className="grid h-40 place-items-center bg-surface-2 text-xs text-ink-faint">
                      Cargando foto…
                    </div>
                  )}
                  <span className="block py-1.5 text-center text-xs text-ink-faint">
                    {subiendo ? 'Guardando…' : 'Tocá para cambiar la foto'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={subiendo}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-marca px-4 py-6 text-marca-ink"
                >
                  <IconCamara width={24} height={24} />
                  <span className="text-sm font-semibold">
                    {subiendo ? 'Guardando…' : 'Agregar foto del ticket'}
                  </span>
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  tap()
                  void eliminar()
                }}
                className="text-sm font-medium text-alerta"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={onCerrar}
                className="btn-primary"
              >
                Listo
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
