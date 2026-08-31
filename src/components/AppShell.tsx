import { useState } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useDespensa } from '../context/DespensaContext'
import {
  IconAjustes,
  IconCarrito,
  IconDespensa,
  IconTicket,
} from './iconos'
import { LogoMark } from './Logo'
import { spring } from '../lib/ui'

/**
 * Congela el contenido de la ruta al montarse. Sin esto, con
 * <AnimatePresence mode="wait"> el <Outlet> de la página que sale ya muestra
 * la página nueva, y quedan dos instancias iguales a la vez (layoutId
 * duplicado -> la pantalla queda en blanco hasta refrescar).
 */
function RutaCongelada() {
  const outlet = useOutlet()
  const [congelado] = useState(outlet)
  return congelado
}

const tabs = [
  { to: '/', label: 'Despensa', Icon: IconDespensa, end: true },
  { to: '/lista', label: 'Lista', Icon: IconCarrito, end: false },
  { to: '/historial', label: 'Historial', Icon: IconTicket, end: false },
  { to: '/ajustes', label: 'Ajustes', Icon: IconAjustes, end: false },
]

export function AppShell() {
  const { lista, hogar } = useDespensa()
  const location = useLocation()
  const reduce = useReducedMotion()
  const pendientes = lista.filter((i) => i.estado === 'pendiente').length

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col">
      <header className="safe-top sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-5 py-2.5">
          <LogoMark size={34} />
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold tracking-tight">
              SyN <span className="text-ink-soft">Mercadería</span>
            </p>
            <p className="text-[11px] text-ink-faint">{hogar?.nombre}</p>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 px-5 pb-28 pt-5"
        >
          <RutaCongelada />
        </motion.main>
      </AnimatePresence>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md justify-around border-t border-line bg-bg/90 px-2 backdrop-blur-md">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="tab-pill"
                    transition={spring}
                    className="absolute inset-x-2 top-1 bottom-1 -z-10 rounded-2xl bg-marca-soft"
                  />
                ) : null}
                <span className="relative">
                  <Icon
                    width={22}
                    height={22}
                    className={isActive ? 'text-marca' : 'text-ink-faint'}
                  />
                  {to === '/lista' && pendientes > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-alerta px-1 text-[10px] font-bold text-white">
                      {pendientes}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? 'text-marca' : 'text-ink-faint'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
