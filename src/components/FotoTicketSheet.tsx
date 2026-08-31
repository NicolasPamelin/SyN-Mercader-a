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
  const [total, setTotal] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    if (!compraId) {
      setArchivo(null)
      setPreview(null)
      setTotal('')
    }
  }, [compraId])

  useEffect(() => {
    if (!archivo) return
    const url = URL.createObjectURL(archivo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const guardarTotal = async () => {
    const n = Number(total.replace(',', '.'))
    if (compraId && total.trim() && !Number.isNaN(n)) {
      await supabase.from('compras').update({ total: n }).eq('id', compraId)
    }
  }

  const cerrar = async () => {
    await guardarTotal()
    onListo?.()
    onCerrar()
  }

  const guardar = async () => {
    if (!compraId || !archivo) return cerrar()
    setSubiendo(true)
    try {
      await subirTicket(hogarId, compraId, archivo)
      await guardarTotal()
    } finally {
      setSubiendo(false)
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
          onClick={cerrar}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="safe-bottom w-full max-w-md rounded-t-[1.75rem] border border-line bg-surface p-5 shadow-lift sm:rounded-[1.75rem]"
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line-strong sm:hidden" />

            <div className="mb-4 flex items-center gap-2.5">
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
                className="mb-3 block w-full overflow-hidden rounded-xl border border-line"
              >
                <img
                  src={preview}
                  alt="Ticket"
                  className="max-h-56 w-full object-contain bg-surface-2"
                />
                <span className="block py-1.5 text-center text-xs text-ink-faint">
                  Tocá para cambiar la foto
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mb-3 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-marca px-4 py-6 text-marca-ink"
              >
                <IconCamara width={26} height={26} />
                <span className="text-sm font-semibold">
                  Sacar foto del ticket
                </span>
              </button>
            )}

            <label className="mb-4 block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Total gastado (opcional)
              </span>
              <input
                inputMode="decimal"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="$"
                className="input"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cerrar}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink-soft"
              >
                {archivo ? 'Descartar' : 'Ahora no'}
              </button>
              <button
                type="button"
                onClick={guardar}
                disabled={subiendo}
                className="btn-primary"
              >
                {subiendo ? 'Guardando…' : archivo ? 'Guardar foto' : 'Listo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
