import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { supabase } from '../lib/supabase'
import { subirTicket } from '../lib/tickets'
import { spring } from '../lib/ui'
import { IconCamara, IconCheck } from './iconos'

interface Props {
  compraId: string | null
  hogarId: string
  cantidad: number
  onCerrar: () => void
  onListo?: () => void
}

export function FotoTicketSheet({
  compraId,
  hogarId,
  cantidad,
  onCerrar,
  onListo,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mercado, setMercado] = useState('')
  const [total, setTotal] = useState('')
  const [recientes, setRecientes] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!compraId) {
      setArchivo(null)
      setPreview(null)
      setMercado('')
      setTotal('')
      return
    }
    supabase
      .from('compras')
      .select('mercado')
      .eq('hogar_id', hogarId)
      .not('mercado', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        const vistos = new Set<string>()
        for (const r of (data as { mercado: string }[]) ?? []) {
          if (r.mercado) vistos.add(r.mercado)
        }
        setRecientes([...vistos])
      })
  }, [compraId, hogarId])

  useEffect(() => {
    if (!archivo) return
    const url = URL.createObjectURL(archivo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const guardar = async () => {
    if (!compraId) return onCerrar()
    setGuardando(true)
    try {
      const patch: Record<string, unknown> = {}
      if (mercado.trim()) patch.mercado = mercado.trim()
      const n = Number(total.replace(',', '.').replace(/[^0-9.]/g, ''))
      if (total.trim() && !Number.isNaN(n)) patch.total = n
      if (Object.keys(patch).length) {
        await supabase.from('compras').update(patch).eq('id', compraId)
      }
      if (archivo) await subirTicket(hogarId, compraId, archivo)
    } finally {
      setGuardando(false)
    }
    onListo?.()
    onCerrar()
  }

  return (
    <AnimatePresence>
      {compraId ? (
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

            <div className="flex shrink-0 items-center gap-2.5 px-5 pb-3 pt-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-marca text-white">
                <IconCheck width={18} height={18} />
              </span>
              <div>
                <p className="font-semibold">Compra guardada</p>
                <p className="text-xs text-ink-soft">
                  {cantidad} {cantidad === 1 ? 'producto' : 'productos'} al stock
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />

              {preview ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="block w-full overflow-hidden rounded-xl border border-line"
                >
                  <img
                    src={preview}
                    alt="Ticket"
                    className="max-h-56 w-full bg-surface-2 object-contain"
                  />
                  <span className="block py-1.5 text-center text-xs text-ink-faint">
                    Tocá para cambiar la foto
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-marca px-4 py-6 text-marca-ink"
                >
                  <IconCamara width={26} height={26} />
                  <span className="text-sm font-semibold">
                    Sacar foto del ticket
                  </span>
                </button>
              )}

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Supermercado
                </span>
                <input
                  value={mercado}
                  onChange={(e) => setMercado(e.target.value)}
                  list="mercados-recientes"
                  placeholder="Carrefour, Día, el chino…"
                  className="input"
                />
                <datalist id="mercados-recientes">
                  {recientes.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  Total gastado
                </span>
                <input
                  inputMode="decimal"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="$"
                  className="input"
                />
              </label>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink-soft"
              >
                Omitir
              </button>
              <button
                type="button"
                onClick={guardar}
                disabled={guardando}
                className="btn-primary"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
