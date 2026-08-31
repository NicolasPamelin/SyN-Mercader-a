import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { spring } from '../../lib/ui'

interface Props {
  abierto: boolean
  titulo: string
  descripcion?: string
  valorInicial?: string
  placeholder?: string
  textoBoton?: string
  maxLength?: number
  onCerrar: () => void
  onConfirmar: (valor: string) => void | Promise<void>
}

/** Hoja inferior con un solo campo de texto. Para "nueva despensa", renombrar, etc. */
export function TextoSheet({
  abierto,
  titulo,
  descripcion,
  valorInicial = '',
  placeholder,
  textoBoton = 'Guardar',
  maxLength = 40,
  onCerrar,
  onConfirmar,
}: Props) {
  const [valor, setValor] = useState(valorInicial)

  useEffect(() => {
    if (abierto) setValor(valorInicial)
  }, [abierto, valorInicial])

  const confirmar = async () => {
    if (!valor.trim()) return
    await onConfirmar(valor.trim())
    onCerrar()
  }

  return (
    <AnimatePresence>
      {abierto ? (
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
            className="safe-bottom w-full max-w-md rounded-t-[1.75rem] border border-line bg-surface p-5 shadow-lift sm:rounded-[1.75rem]"
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line-strong sm:hidden" />
            <h2 className="text-lg">{titulo}</h2>
            {descripcion ? (
              <p className="mb-3 mt-1 text-xs text-ink-soft">{descripcion}</p>
            ) : (
              <div className="mb-3" />
            )}
            <input
              autoFocus
              value={valor}
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmar()}
              className="input"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink-soft"
              >
                Cancelar
              </button>
              <button type="button" onClick={confirmar} className="btn-primary">
                {textoBoton}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
