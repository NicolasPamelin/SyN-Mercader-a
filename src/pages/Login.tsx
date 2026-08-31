import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { ingresar, registrarse } = useAuth()
  const [modo, setModo] = useState<'ingresar' | 'registrarse'>('ingresar')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(null)
    setCargando(true)
    const fn = modo === 'ingresar' ? ingresar : registrarse
    const { error } = await fn(email.trim(), pass)
    setCargando(false)
    if (error) {
      setError(error)
      return
    }
    if (modo === 'registrarse') {
      setOk('Cuenta creada. Si te pide confirmar el mail, revisá tu casilla y después ingresá.')
      setModo('ingresar')
    }
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-marca-600 text-2xl font-black text-white">
          SyN
        </div>
        <h1 className="text-xl font-bold">SyN Mercadería</h1>
        <p className="text-sm text-slate-500">
          El stock de casa y la lista del super, para los dos.
        </p>
      </div>

      <form onSubmit={enviar} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          autoComplete={modo === 'ingresar' ? 'current-password' : 'new-password'}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="input"
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {ok ? <p className="text-sm text-marca-700">{ok}</p> : null}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-xl bg-marca-600 py-3 font-semibold text-white disabled:opacity-60"
        >
          {cargando
            ? 'Un segundo…'
            : modo === 'ingresar'
              ? 'Ingresar'
              : 'Crear cuenta'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setModo(modo === 'ingresar' ? 'registrarse' : 'ingresar')
          setError(null)
          setOk(null)
        }}
        className="mt-4 text-center text-sm text-slate-500"
      >
        {modo === 'ingresar'
          ? '¿No tenés cuenta? Crear una'
          : '¿Ya tenés cuenta? Ingresar'}
      </button>
    </div>
  )
}
