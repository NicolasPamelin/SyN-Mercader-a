import type { Unidad } from './types'

// Pocas y claras. Después se agregan más si hace falta.
// El orden es el del recorrido típico del super.
export const CATEGORIAS: string[] = [
  'Almacén',
  'Heladeras',
  'Bebidas',
  'Limpieza',
  'Higiene',
]

export const CATEGORIA_DEFAULT = 'Almacén'

export const UNIDADES: Unidad[] = [
  'unidad',
  'paquete',
  'kg',
  'g',
  'litro',
  'ml',
  'docena',
  'lata',
  'botella',
]

export const ordenCategoria = (cat: string): number => {
  const i = CATEGORIAS.indexOf(cat)
  return i === -1 ? CATEGORIAS.length : i
}

// 1 -> "1"   0.5 -> "½"   1.5 -> "1½"   2.25 -> "2,25"
export function formatCantidad(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const entero = Math.floor(n)
  const resto = n - entero
  if (Math.abs(resto - 0.5) < 0.001) return entero === 0 ? '½' : `${entero}½`
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}
