import { Navigate, Route, Routes } from 'react-router-dom'
import { supabaseConfigurado } from './lib/supabase'
import { useAuth } from './context/AuthContext'
import { DespensaProvider, useDespensa } from './context/DespensaContext'
import { ToastProvider } from './components/ui/Toast'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LogoMark } from './components/Logo'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Stock } from './pages/Stock'
import { Lista } from './pages/Lista'
import { Ajustes } from './pages/Ajustes'

function App() {
  if (!supabaseConfigurado) return <FaltaConfig />

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthGate>
          <DespensaProvider>
            <ConHogar />
          </DespensaProvider>
        </AuthGate>
      </ToastProvider>
    </ErrorBoundary>
  )
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, cargando } = useAuth()
  if (cargando) return <Splash />
  if (!session) return <Login />
  return <>{children}</>
}

function ConHogar() {
  const { cargando, hogar } = useDespensa()
  if (cargando) return <Splash />
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

function Splash() {
  return (
    <div className="grid min-h-[100svh] place-items-center">
      <div className="flex animate-[syn-fade-up_0.4s_ease] flex-col items-center gap-3">
        <LogoMark size={56} />
        <span className="text-xs text-ink-faint">Cargando tu despensa…</span>
      </div>
    </div>
  )
}

function FaltaConfig() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-xl">Falta conectar Supabase</h1>
      <p className="mb-4 text-sm text-ink-soft">
        Completá <code className="rounded bg-surface-2 px-1">.env.local</code> con
        los datos de tu proyecto y reiniciá <code>npm run dev</code>:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-xs text-bg">
        {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
      </pre>
    </div>
  )
}

export default App
