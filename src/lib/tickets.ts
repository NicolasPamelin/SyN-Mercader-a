import { supabase } from './supabase'

const BUCKET = 'tickets'

/** Achica y comprime la foto antes de subirla (las fotos de celu pesan 3-5 MB). */
export async function comprimirImagen(
  file: File,
  maxLado = 1600,
  calidad = 0.72,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  })
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      'image/jpeg',
      calidad,
    )
  })
}

export async function subirTicket(
  hogarId: string,
  compraId: string,
  file: File,
): Promise<string> {
  const blob = await comprimirImagen(file)
  const path = `${hogarId}/${compraId}.jpg`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  if (error) throw error
  await supabase.from('compras').update({ foto_path: path }).eq('id', compraId)
  return path
}

export async function borrarTicket(compraId: string, path: string) {
  await supabase.storage.from(BUCKET).remove([path])
  await supabase.from('compras').update({ foto_path: null }).eq('id', compraId)
}

const cacheUrls = new Map<string, { url: string; exp: number }>()

/** URL firmada (temporal) para mostrar la foto de un bucket privado. */
export async function urlTicket(path: string): Promise<string | null> {
  const cached = cacheUrls.get(path)
  if (cached && cached.exp > Date.now()) return cached.url
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)
  if (!data?.signedUrl) return null
  cacheUrls.set(path, { url: data.signedUrl, exp: Date.now() + 3000_000 })
  return data.signedUrl
}
