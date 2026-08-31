import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = Boolean(url && anonKey)

if (!supabaseConfigurado) {
  console.warn(
    'Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local',
  )
}

// Si no está configurado usamos strings dummy para no romper el import;
// la UI muestra un cartel pidiendo completar el .env.local.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
)
