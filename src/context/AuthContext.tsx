import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthCtx {
  session: Session | null
  user: User | null
  cargando: boolean
  registrarse: (email: string, pass: string) => Promise<{ error: string | null }>
  ingresar: (email: string, pass: string) => Promise<{ error: string | null }>
  salir: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const registrarse = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ email, password: pass })
    return { error: error ? traducirError(error.message) : null }
  }

  const ingresar = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })
    return { error: error ? traducirError(error.message) : null }
  }

  const salir = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        cargando,
        registrarse,
        ingresar,
        salir,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth fuera de AuthProvider')
  return c
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email o contraseña incorrectos.'
  if (m.includes('already registered')) return 'Ese email ya está registrado, probá ingresar.'
  if (m.includes('password should be at least'))
    return 'La contraseña necesita al menos 6 caracteres.'
  if (m.includes('unable to validate email')) return 'Ese email no parece válido.'
  return msg
}
