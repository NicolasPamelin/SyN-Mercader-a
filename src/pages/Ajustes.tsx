import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDespensa } from '../context/DespensaContext'
import { supabase } from '../lib/supabase'
import { IconCheck, IconLapiz, IconMas, IconSalir } from '../components/iconos'
import { useToast } from '../components/ui/Toast'
import { TextoSheet } from '../components/ui/TextoSheet'
import { tap } from '../lib/ui'

export function Ajustes() {
  const { user, salir } = useAuth()
  const {
    hogar,
    hogares,
    productos,
    cambiarHogar,
    crearHogar,
    renombrarHogar,
    salirHogar,
  } = useDespensa()
  const toast = useToast()
  const [miembros, setMiembros] = useState<
    { user_id: string; alias: string | null; rol: string }[]
  >([])
  const [sheet, setSheet] = useState<'nueva' | 'renombrar' | null>(null)

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
      tap()
      toast('Código copiado')
    } catch {
      toast('Copialo a mano: ' + hogar.codigo_invite, 'info')
    }
  }

  const esenciales = productos.filter((p) => p.esencial).length
  const bajos = productos.filter(
    (p) => p.minimo > 0 && p.cantidad <= p.minimo,
  ).length

  return (
    <div className="space-y-5">
      <h1 className="text-[1.7rem]">Ajustes</h1>

      {/* --- Despensas --- */}
      <section className="card overflow-hidden">
        <p className="eyebrow px-4 pt-4">Tus despensas</p>
        <ul className="mt-2">
          {hogares.map((h) => {
            const activa = h.id === hogar?.id
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!activa) {
                      tap()
                      cambiarHogar(h.id)
                    }
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                      activa
                        ? 'border-marca bg-marca text-white'
                        : 'border-line-strong text-transparent'
                    }`}
                  >
                    <IconCheck width={13} height={13} />
                  </span>
                  <span
                    className={`flex-1 font-medium ${activa ? '' : 'text-ink-soft'}`}
                  >
                    {h.nombre}
                  </span>
                  {activa ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSheet('renombrar')
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-faint active:bg-surface-2"
                      aria-label="Renombrar"
                    >
                      <IconLapiz width={15} height={15} />
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          onClick={() => setSheet('nueva')}
          className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-sm font-semibold text-marca-ink"
        >
          <IconMas width={16} height={16} />
          Nueva despensa
        </button>
      </section>

      {/* --- Resumen de la activa --- */}
      <section className="card p-4">
        <p className="eyebrow mb-2">{hogar?.nombre}</p>
        <div className="flex gap-5 text-sm">
          <Dato n={productos.length} l="productos" />
          <Dato n={esenciales} l="esenciales" />
          <Dato n={bajos} l="en falta" alerta={bajos > 0} />
        </div>
      </section>

      {/* --- Invitar --- */}
      <section className="card p-4">
        <p className="eyebrow mb-2">Invitar a esta despensa</p>
        <p className="mb-3 text-xs text-ink-soft">
          Que instale la app, cree su cuenta y ponga este código en “Tengo un
          código”.
        </p>
        <button
          type="button"
          onClick={copiar}
          className="flex w-full items-center justify-between rounded-xl border border-dashed border-marca bg-marca-soft/60 px-4 py-3"
        >
          <span className="font-display text-xl font-bold tracking-[0.3em] text-marca-ink">
            {hogar?.codigo_invite}
          </span>
          <span className="text-xs font-medium text-ink-soft">Copiar</span>
        </button>
      </section>

      {/* --- Miembros --- */}
      <section className="card p-4">
        <p className="eyebrow mb-3">Quiénes usan esta despensa</p>
        <ul className="space-y-2">
          {miembros.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-ink-soft">
                  {(m.alias || '?').slice(0, 1).toUpperCase()}
                </span>
                {m.alias || 'Sin nombre'}
                {m.user_id === user?.id ? (
                  <span className="text-ink-faint">· vos</span>
                ) : null}
              </span>
              <span className="text-xs capitalize text-ink-faint">{m.rol}</span>
            </li>
          ))}
        </ul>
      </section>

      {hogares.length > 1 && hogar ? (
        <button
          type="button"
          onClick={async () => {
            await salirHogar(hogar.id)
            toast('Saliste de ' + hogar.nombre, 'info')
          }}
          className="w-full rounded-xl py-3 text-sm font-medium text-alerta"
        >
          Salir de “{hogar.nombre}”
        </button>
      ) : null}

      <button type="button" onClick={salir} className="btn-ghost w-full">
        <IconSalir width={17} height={17} />
        Cerrar sesión
      </button>

      <p className="pt-1 text-center text-xs text-ink-faint">
        SyN Mercadería · {user?.email}
      </p>

      <TextoSheet
        abierto={sheet === 'nueva'}
        titulo="Nueva despensa"
        descripcion="Otra lista aparte: viajes, la casa de fin de semana, la oficina…"
        placeholder="Viajes"
        textoBoton="Crear"
        onCerrar={() => setSheet(null)}
        onConfirmar={async (nombre) => {
          const err = await crearHogar(nombre, '')
          toast(err ? err : `“${nombre}” lista`, err ? 'alerta' : 'ok')
        }}
      />
      <TextoSheet
        abierto={sheet === 'renombrar'}
        titulo="Renombrar despensa"
        valorInicial={hogar?.nombre ?? ''}
        textoBoton="Guardar"
        onCerrar={() => setSheet(null)}
        onConfirmar={async (nombre) => {
          if (hogar) await renombrarHogar(hogar.id, nombre)
        }}
      />
    </div>
  )
}

function Dato({ n, l, alerta }: { n: number; l: string; alerta?: boolean }) {
  return (
    <span className="flex flex-col">
      <span
        className={`font-display text-lg font-semibold tabular-nums ${
          alerta ? 'text-alerta' : ''
        }`}
      >
        {n}
      </span>
      <span className="text-[11px] text-ink-faint">{l}</span>
    </span>
  )
}
