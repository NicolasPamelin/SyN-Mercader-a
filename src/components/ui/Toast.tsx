import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconCheck } from '../iconos'
import { spring } from '../../lib/ui'

type Tono = 'ok' | 'info' | 'alerta'
interface Toast {
  id: number
  texto: string
  tono: Tono
}

const Ctx = createContext<(texto: string, tono?: Tono) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const mostrar = useCallback((texto: string, tono: Tono = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, texto, tono }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={mostrar}>
      {children}
      <div className="safe-top pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md flex-col items-center gap-2 px-4 pt-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={spring}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium shadow-lift"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${
                  t.tono === 'alerta' ? 'bg-alerta' : 'bg-marca'
                }`}
              >
                <IconCheck width={13} height={13} />
              </span>
              {t.texto}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
