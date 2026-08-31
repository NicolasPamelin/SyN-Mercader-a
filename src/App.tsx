import { Navigate, Route, Routes } from 'react-router-dom'
import { supabaseConfigurado } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import { DespensaProvider, useDespensa } from './context/DespensaContext'
import { AppShell } from './components/AppShell'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Stock } from './pages/Stock'
import { Lista } from './pages/Lista'
import { Ajustes } from './pages/Ajustes'

function App() {
  if (!supabaseConfigurado) return <FaltaConfig />

  return (
    <AuthGate>
      <DespensaProvider>
        <ConHogar />
      </DespensaProvider>
    </AuthGate>
  )
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, cargando } = useAuth()
  if (cargando) return <Cargando />
  if (!session) return <Login />
  return <>{children}</>
}

function ConHogar() {
  const { cargando, hogar } = useDespensa()
  if (cargando) return <Cargando />
  if (!hogar) return <Onboarding />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Stock />} />
        <Route path="lista" element={<Lista />} />
        <Route path="ajustes" element={<Ajustes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Cargando() {
  return (
    <div className="grid min-h-[100svh] place-items-center text-sm text-slate-400">
      Cargando…
    </div>
  )
}

function FaltaConfig() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-xl font-bold">Falta conectar Supabase</h1>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        Completá <code>.env.local</code> con los datos de tu proyecto y reiniciá{' '}
        <code>npm run dev</code>:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
        {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
      </pre>
    </div>
  )
}

export default App
