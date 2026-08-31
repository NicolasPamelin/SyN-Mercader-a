import { useState } from 'react'
import { useDespensa } from '../context/DespensaContext'

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
    if (err) setError(err === 'Código inválido' ? 'Ese código no existe. Revisalo con quien te invitó.' : err)
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-xl font-bold">Armá tu despensa</h1>
      <p className="mb-6 text-sm text-slate-500">
        Creá una nueva o sumate a la de tu pareja con el código.
      </p>

      <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(['crear', 'unirse'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              modo === m ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'
            }`}
          >
            {m === 'crear' ? 'Crear nueva' : 'Tengo un código'}
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
            placeholder="Código de invitación (6 caracteres)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={6}
            className="input tracking-widest"
          />
        )}
        <input
          placeholder="¿Cómo te llamás? (Sofi / Nico)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="input"
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-xl bg-marca-600 py-3 font-semibold text-white disabled:opacity-60"
        >
          {cargando ? 'Un segundo…' : modo === 'crear' ? 'Crear despensa' : 'Sumarme'}
        </button>
      </form>
    </div>
  )
}
