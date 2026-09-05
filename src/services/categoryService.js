import { supabase } from './supabase'

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createCategory(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}
