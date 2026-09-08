import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Hogar, ItemCompra, Producto, Unidad } from '../lib/types'

interface NuevoProducto {
  nombre: string
  categoria: string
  unidad: Unidad
  cantidad: number
  minimo: number
  paso: number
  esencial: boolean
}

interface DespensaCtx {
  cargando: boolean
  hogar: Hogar | null
  hogares: Hogar[]
  productos: Producto[]
  lista: ItemCompra[]
  cambiarHogar: (id: string) => Promise<void>
  crearHogar: (nombre: string, alias: string) => Promise<string | null>
  unirseHogar: (codigo: string, alias: string) => Promise<string | null>
  renombrarHogar: (id: string, nombre: string) => Promise<void>
  salirHogar: (id: string) => Promise<void>
  agregarProducto: (p: NuevoProducto) => Promise<void>
  editarProducto: (id: string, patch: Partial<Producto>) => Promise<void>
  archivarProducto: (id: string) => Promise<void>
  ajustarCantidad: (id: string, delta: number) => Promise<void>
  fijarCantidad: (id: string, valor: number) => Promise<void>
  agregarItemManual: (entrada: {
    productoId?: string
    nombreLibre?: string
    categoria?: string
    cantidad: number
  }) => Promise<void>
  toggleCarrito: (item: ItemCompra) => Promise<void>
  cambiarCantidadItem: (id: string, cantidad: number) => Promise<void>
  quitarItem: (id: string) => Promise<void>
  confirmarCompra: () => Promise<{ count: number; compraId: string | null }>
  recargar: () => Promise<void>
}

const Ctx = createContext<DespensaCtx | undefined>(undefined)

const LS_KEY = 'syn.hogar_activo'
const leerGuardado = () => {
  try {
    return localStorage.getItem(LS_KEY)
  } catch {
    return null
  }
}
const guardarActivo = (id: string) => {
  try {
    localStorage.setItem(LS_KEY, id)
  } catch {
    /* private mode, etc. */
  }
}

export function DespensaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [hogar, setHogar] = useState<Hogar | null>(null)
  const [hogares, setHogares] = useState<Hogar[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [lista, setLista] = useState<ItemCompra[]>([])
  const [cargando, setCargando] = useState(true)
  const hogarIdRef = useRef<string | null>(null)

  const cargarProductosYLista = useCallback(async (hogarId: string) => {
    const [{ data: prods }, { data: items }] = await Promise.all([
      supabase
        .from('productos')
        .select('*')
        .eq('hogar_id', hogarId)
        .eq('archivado', false)
        .order('nombre'),
      supabase.from('items_compra').select('*').eq('hogar_id', hogarId),
    ])
    setProductos(prods ?? [])
    setLista(items ?? [])
  }, [])

  const cargarTodo = useCallback(async () => {
    if (!user) {
      hogarIdRef.current = null
      setHogar(null)
      setHogares([])
      setProductos([])
      setLista([])
      setCargando(false)
      return
    }
    setCargando(true)

    const { data: ms } = await supabase
      .from('miembros')
      .select('hogar_id')
      .eq('user_id', user.id)
    const ids = (ms ?? []).map((m) => m.hogar_id)

    if (ids.length === 0) {
      hogarIdRef.current = null
      setHogar(null)
      setHogares([])
      setCargando(false)
      return
    }

    const { data: hs } = await supabase
      .from('hogares')
      .select('*')
      .in('id', ids)
      .order('created_at')
    const lista = hs ?? []
    setHogares(lista)

    const guardado = leerGuardado()
    const activo = lista.find((h) => h.id === guardado) ?? lista[0]
    hogarIdRef.current = activo?.id ?? null
    setHogar(activo ?? null)
    if (activo) {
      guardarActivo(activo.id)
      await cargarProductosYLista(activo.id)
    }
    setCargando(false)
  }, [user, cargarProductosYLista])

  useEffect(() => {
    void cargarTodo()
  }, [cargarTodo])

  // Realtime: cuando el otro miembro toca algo, refrescamos.
  useEffect(() => {
    if (!hogar) return
    const canal = supabase
      .channel(`hogar-${hogar.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'productos',
          filter: `hogar_id=eq.${hogar.id}`,
        },
        () => void cargarProductosYLista(hogar.id),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items_compra',
          filter: `hogar_id=eq.${hogar.id}`,
        },
        () => void cargarProductosYLista(hogar.id),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(canal)
    }
  }, [hogar, cargarProductosYLista])

  const hid = () => {
    const id = hogarIdRef.current
    if (!id) throw new Error('Sin despensa activa')
    return id
  }

  const refrescar = async () => {
    if (hogarIdRef.current) await cargarProductosYLista(hogarIdRef.current)
  }

  const cambiarHogar = useCallback(
    async (id: string) => {
      const h = hogares.find((x) => x.id === id)
      if (!h || id === hogarIdRef.current) return
      guardarActivo(id)
      hogarIdRef.current = id
      setHogar(h)
      setProductos([])
      setLista([])
      await cargarProductosYLista(id)
    },
    [hogares, cargarProductosYLista],
  )

  const crearHogar = async (nombre: string, alias: string) => {
    const { data, error } = await supabase.rpc('crear_hogar', {
      p_nombre: nombre,
      p_alias: alias || null,
    })
    if (error) return error.message
    const nuevo = (data as { id?: string } | null)?.id
    if (nuevo) guardarActivo(nuevo)
    await cargarTodo()
    return null
  }

  const unirseHogar = async (codigo: string, alias: string) => {
    const { data, error } = await supabase.rpc('unirse_a_hogar', {
      p_codigo: codigo,
      p_alias: alias || null,
    })
    if (error) return error.message
    const unido = (data as { id?: string } | null)?.id
    if (unido) guardarActivo(unido)
    await cargarTodo()
    return null
  }

  const renombrarHogar = async (id: string, nombre: string) => {
    const n = nombre.trim()
    if (!n) return
    setHogares((hs) => hs.map((h) => (h.id === id ? { ...h, nombre: n } : h)))
    setHogar((h) => (h && h.id === id ? { ...h, nombre: n } : h))
    await supabase.from('hogares').update({ nombre: n }).eq('id', id)
  }

  const salirHogar = async (id: string) => {
    if (!user || hogares.length <= 1) return
    await supabase
      .from('miembros')
      .delete()
      .eq('hogar_id', id)
      .eq('user_id', user.id)
    if (leerGuardado() === id) {
      try {
        localStorage.removeItem(LS_KEY)
      } catch {
        /* noop */
      }
    }
    await cargarTodo()
  }

  const agregarProducto = async (p: NuevoProducto) => {
    await supabase.from('productos').insert({ ...p, hogar_id: hid() })
    await refrescar()
  }

  const editarProducto = async (id: string, patch: Partial<Producto>) => {
    setProductos((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    await supabase.from('productos').update(patch).eq('id', id)
    await refrescar()
  }

  const archivarProducto = async (id: string) => {
    setProductos((xs) => xs.filter((x) => x.id !== id))
    await supabase.from('productos').update({ archivado: true }).eq('id', id)
    await refrescar()
  }

  const ajustarCantidad = async (id: string, delta: number) => {
    const actual = productos.find((x) => x.id === id)
    if (!actual) return
    const nueva = Math.max(0, redondear(actual.cantidad + delta))
    setProductos((xs) =>
      xs.map((x) => (x.id === id ? { ...x, cantidad: nueva } : x)),
    )
    await supabase.from('productos').update({ cantidad: nueva }).eq('id', id)
    await refrescar()
  }

  const fijarCantidad = async (id: string, valor: number) => {
    const nueva = Math.max(0, redondear(valor))
    setProductos((xs) =>
      xs.map((x) => (x.id === id ? { ...x, cantidad: nueva } : x)),
    )
    await supabase.from('productos').update({ cantidad: nueva }).eq('id', id)
    await refrescar()
  }

  const agregarItemManual: DespensaCtx['agregarItemManual'] = async (entrada) => {
    if (entrada.productoId) {
      await supabase.from('items_compra').upsert(
        {
          hogar_id: hid(),
          producto_id: entrada.productoId,
          cantidad: entrada.cantidad,
          origen: 'manual',
          estado: 'pendiente',
        },
        { onConflict: 'hogar_id,producto_id' },
      )
    } else {
      await supabase.from('items_compra').insert({
        hogar_id: hid(),
        nombre_libre: entrada.nombreLibre,
        categoria: entrada.categoria ?? null,
        cantidad: entrada.cantidad,
        origen: 'manual',
        estado: 'pendiente',
      })
    }
    await refrescar()
  }

  const toggleCarrito = async (item: ItemCompra) => {
    const nuevo = item.estado === 'en_carrito' ? 'pendiente' : 'en_carrito'
    setLista((xs) =>
      xs.map((x) => (x.id === item.id ? { ...x, estado: nuevo } : x)),
    )
    await supabase
      .from('items_compra')
      .update({ estado: nuevo })
      .eq('id', item.id)
  }

  const cambiarCantidadItem = async (id: string, cantidad: number) => {
    const c = Math.max(redondear(cantidad), 0.01)
    setLista((xs) => xs.map((x) => (x.id === id ? { ...x, cantidad: c } : x)))
    await supabase.from('items_compra').update({ cantidad: c }).eq('id', id)
  }

  const quitarItem = async (id: string) => {
    setLista((xs) => xs.filter((x) => x.id !== id))
    await supabase.from('items_compra').delete().eq('id', id)
  }

  const confirmarCompra = async () => {
    const comprados = lista.filter((x) => x.estado === 'en_carrito')
    if (comprados.length === 0) return { count: 0, compraId: null }

    const snapshot = comprados.map((item) => {
      const p = item.producto_id
        ? productos.find((x) => x.id === item.producto_id)
        : null
      return {
        nombre: p?.nombre ?? item.nombre_libre ?? 'Item',
        cantidad: item.cantidad,
        unidad: p?.unidad ?? '',
      }
    })

    // guarda la compra en el historial
    const { data: compra } = await supabase
      .from('compras')
      .insert({
        hogar_id: hid(),
        items: snapshot,
        cant_items: comprados.length,
      })
      .select('id')
      .single()

    for (const item of comprados) {
      await supabase.from('items_compra').delete().eq('id', item.id)
      if (item.producto_id) {
        const prod = productos.find((p) => p.id === item.producto_id)
        const base = prod?.cantidad ?? 0
        await supabase
          .from('productos')
          .update({ cantidad: redondear(base + item.cantidad) })
          .eq('id', item.producto_id)
      }
    }
    await refrescar()
    return {
      count: comprados.length,
      compraId: (compra as { id?: string } | null)?.id ?? null,
    }
  }

  return (
    <Ctx.Provider
      value={{
        cargando,
        hogar,
        hogares,
        productos,
        lista,
        cambiarHogar,
        crearHogar,
        unirseHogar,
        renombrarHogar,
        salirHogar,
        agregarProducto,
        editarProducto,
        archivarProducto,
        ajustarCantidad,
        fijarCantidad,
        agregarItemManual,
        toggleCarrito,
        cambiarCantidadItem,
        quitarItem,
        confirmarCompra,
        recargar: cargarTodo,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useDespensa() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useDespensa fuera de DespensaProvider')
  return c
}

// evita 0.1 + 0.2 = 0.30000000000000004
function redondear(n: number): number {
  return Math.round(n * 1000) / 1000
}
