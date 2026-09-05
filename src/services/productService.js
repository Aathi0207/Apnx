import { supabase } from './supabase'

export const productService = {
  async getProducts({ search = '', categoryId = '', minPrice = '', maxPrice = '', sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 12 } = {}) {
    let query = supabase
      .from('products')
      .select(`*, categories(id, name, slug)`, { count: 'exact' })
      .eq('status', 'active')

    if (search) query = query.ilike('name', `%${search}%`)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (minPrice !== '') query = query.gte('price', parseFloat(minPrice))
    if (maxPrice !== '') query = query.lte('price', parseFloat(maxPrice))

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getRelatedProducts(categoryId, excludeId, limit = 4) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug)`)
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .neq('id', excludeId)
      .limit(limit)
    if (error) throw error
    return data
  },

  async getFeaturedProducts(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug)`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getBestSellers(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(id, name, slug)`)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data
  },

  // Admin methods
  async getAllProducts({ search = '', categoryId = '', status = '', page = 1, limit = 20 } = {}) {
    let query = supabase
      .from('products')
      .select(`*, categories(id, name, slug)`, { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (status) query = query.eq('status', status)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
