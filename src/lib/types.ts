export type Unidad =
  | 'unidad'
  | 'paquete'
  | 'kg'
  | 'g'
  | 'litro'
  | 'ml'
  | 'docena'
  | 'lata'
  | 'botella'

export interface Hogar {
  id: string
  nombre: string
  codigo_invite: string
  creado_por: string
  created_at: string
}

export interface Miembro {
  hogar_id: string
  user_id: string
  rol: 'dueño' | 'miembro'
  alias: string | null
  created_at: string
}

export interface Producto {
  id: string
  hogar_id: string
  nombre: string
  categoria: string
  unidad: Unidad
  cantidad: number
  minimo: number
  paso: number
  esencial: boolean
  archivado: boolean
  created_at: string
  updated_at: string
}

export interface ItemCompra {
  id: string
  hogar_id: string
  producto_id: string | null
  nombre_libre: string | null
  categoria: string | null
  cantidad: number
  estado: 'pendiente' | 'en_carrito'
  origen: 'auto' | 'manual'
  created_at: string
}

export interface CompraItem {
  nombre: string
  cantidad: number
  unidad: string
}

export interface Compra {
  id: string
  hogar_id: string
  fecha: string
  items: CompraItem[]
  cant_items: number
  total: number | null
  mercado: string | null
  nota: string | null
  foto_path: string | null
  creada_por: string | null
  created_at: string
}
