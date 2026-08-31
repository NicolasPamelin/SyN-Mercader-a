import { useState } from 'react'
import { motion } from 'motion/react'
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
    if (error) return setError(error)
    if (modo === 'registrarse') {
      setOk('Cuenta creada. Si te pide confirmar el mail, revisá tu casilla y después ingresá.')
      setModo('ingresar')
    }
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-7">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-9">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-marca text-lg font-bold text-white shadow-lift">
            SyN
          </span>
          <h1 className="text-[1.9rem] leading-tight">
            El stock de casa y la lista del super, para los dos.
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Sumás y descontás con un toque. Lo que falta, se arma solo.
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

          {error ? <p className="text-sm text-alerta">{error}</p> : null}
          {ok ? <p className="text-sm text-marca-ink">{ok}</p> : null}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary w-full py-3.5"
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
          className="mt-4 w-full text-center text-sm text-ink-soft"
        >
          {modo === 'ingresar'
            ? '¿No tenés cuenta? Crear una'
            : '¿Ya tenés cuenta? Ingresar'}
        </button>
      </motion.div>
    </div>
  )
}
