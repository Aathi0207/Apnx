import { supabase } from './supabase'

const BUCKET = 'product-images'

export const storageService = {
  async uploadProductImage(file) {
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  },

  async deleteProductImage(imageUrl) {
    if (!imageUrl) return
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split(`/${BUCKET}/`)
      if (pathParts.length < 2) return
      const filePath = pathParts[1]
      await supabase.storage.from(BUCKET).remove([filePath])
    } catch {
      // Silently fail on delete errors
    }
  },
}
