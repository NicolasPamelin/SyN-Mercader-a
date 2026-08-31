import { useState } from 'react'
import { motion } from 'motion/react'
import { useDespensa } from '../context/DespensaContext'
import { spring } from '../lib/ui'

export function Onboarding() {
  const { crearHogar, unirseHogar } = useDespensa()
  const [modo, setModo] = useState<'crear' | 'unirse'>('crear')
  const [nombreHogar, setNombreHogar] = useState('Nuestra casa')
  const [codigo, setCodigo] = useState('')
  const [alias, setAlias] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const err =
      modo === 'crear'
        ? await crearHogar(nombreHogar, alias)
        : await unirseHogar(codigo, alias)
    setCargando(false)
    if (err)
      setError(
        err === 'Código inválido'
          ? 'Ese código no existe. Revisalo con quien te invitó.'
          : err,
      )
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-7">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-[1.9rem] leading-tight">Armá tu despensa</h1>
        <p className="mb-6 mt-2 text-sm text-ink-soft">
          Creá una nueva o sumate a la de tu pareja con el código.
        </p>

        <div className="mb-5 flex rounded-full bg-surface-2 p-1">
          {(['crear', 'unirse'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className="relative flex-1 rounded-full py-2 text-sm font-semibold"
            >
              {modo === m ? (
                <motion.span
                  layoutId="onb-seg"
                  transition={spring}
                  className="absolute inset-0 -z-10 rounded-full bg-marca shadow-soft"
                />
              ) : null}
              <span className={modo === m ? 'text-white' : 'text-ink-soft'}>
                {m === 'crear' ? 'Crear nueva' : 'Tengo un código'}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="space-y-3">
          {modo === 'crear' ? (
            <input
              required
              placeholder="Nombre de la casa"
              value={nombreHogar}
              onChange={(e) => setNombreHogar(e.target.value)}
              className="input"
            />
          ) : (
            <input
              required
              placeholder="Código (6 caracteres)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              maxLength={6}
              className="input text-center text-lg font-semibold tracking-[0.35em]"
            />
          )}
          <input
            placeholder="¿Cómo te llamás? (Sofi / Nico)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="input"
          />

          {error ? <p className="text-sm text-alerta">{error}</p> : null}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full py-3.5"
          >
            {cargando
              ? 'Un segundo…'
              : modo === 'crear'
                ? 'Crear despensa'
                : 'Sumarme'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
