import { NavLink, Outlet } from 'react-router-dom'
import { useDespensa } from '../context/DespensaContext'
import { IconAjustes, IconCarrito, IconDespensa } from './iconos'

const tabs = [
  { to: '/', label: 'Despensa', Icon: IconDespensa, end: true },
  { to: '/lista', label: 'Lista', Icon: IconCarrito, end: false },
  { to: '/ajustes', label: 'Ajustes', Icon: IconAjustes, end: false },
]

export function AppShell() {
  const { lista } = useDespensa()
  const pendientes = lista.length

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive
                  ? 'text-marca-700 dark:text-marca-500'
                  : 'text-slate-400'
              }`
            }
          >
            <Icon width={22} height={22} />
            {label}
            {to === '/lista' && pendientes > 0 ? (
              <span className="absolute right-1/2 top-1 translate-x-4 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {pendientes}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
