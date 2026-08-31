import type { Unidad } from './types'

// Orden pensado para recorrer el super de la entrada al fondo.
export const CATEGORIAS: string[] = [
  'Verdulería',
  'Carnicería',
  'Fiambrería',
  'Lácteos',
  'Panadería',
  'Almacén',
  'Fideos y arroz',
  'Conservas',
  'Desayuno',
  'Snacks',
  'Bebidas',
  'Congelados',
  'Limpieza',
  'Perfumería',
  'Mascotas',
  'Bazar',
  'General',
]

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
