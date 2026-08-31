import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDespensa } from '../context/DespensaContext'
import { supabase } from '../lib/supabase'
import { IconSalir } from '../components/iconos'

export function Ajustes() {
  const { user, salir } = useAuth()
  const { hogar, productos } = useDespensa()
  const [miembros, setMiembros] = useState<
    { user_id: string; alias: string | null; rol: string }[]
  >([])
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!hogar) return
    supabase
      .from('miembros')
      .select('user_id, alias, rol')
      .eq('hogar_id', hogar.id)
      .then(({ data }) => setMiembros(data ?? []))
  }, [hogar])

  const copiar = async () => {
    if (!hogar) return
    try {
      await navigator.clipboard.writeText(hogar.codigo_invite)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* algunos navegadores bloquean clipboard sin https */
    }
  }

  const esenciales = productos.filter((p) => p.esencial).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-500">Tu despensa</h2>
        <p className="text-lg font-bold">{hogar?.nombre}</p>
        <p className="mt-1 text-xs text-slate-400">
          {productos.length} productos · {esenciales} esenciales
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          Invitar a tu pareja
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          Que instale la app, cree su cuenta y ponga este código en “Tengo un
          código”.
        </p>
        <button
          type="button"
          onClick={copiar}
          className="flex w-full items-center justify-between rounded-xl border border-dashed border-marca-500 px-4 py-3"
        >
          <span className="font-mono text-xl tracking-[0.3em] text-marca-700 dark:text-marca-500">
            {hogar?.codigo_invite}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {copiado ? '¡Copiado!' : 'Tocá para copiar'}
          </span>
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          Quiénes usan esta despensa
        </h2>
        <ul className="space-y-1.5">
          {miembros.map((m) => (
            <li key={m.user_id} className="flex items-center justify-between text-sm">
              <span>
                {m.alias || 'Sin nombre'}
                {m.user_id === user?.id ? ' (vos)' : ''}
              </span>
              <span className="text-xs text-slate-400">{m.rol}</span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={salir}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      >
        <IconSalir width={18} height={18} />
        Cerrar sesión
      </button>

      <p className="text-center text-xs text-slate-300">
        SyN Mercadería · {user?.email}
      </p>
    </div>
  )
}
