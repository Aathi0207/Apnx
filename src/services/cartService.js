import { supabase } from './supabase'

export const cartService = {
  async getOrCreateCart(userId) {
    let { data: cart, error } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      const { data: newCart, error: createError } = await supabase
        .from('cart')
        .insert([{ user_id: userId }])
        .select('id')
        .single()
      if (createError) throw createError
      cart = newCart
    } else if (error) {
      throw error
    }
    return cart
  },

  async getCartItems(userId) {
    const cart = await cartService.getOrCreateCart(userId)
    const { data, error } = await supabase
      .from('cart_items')
      .select(`*, products(id, name, price, discount_price, image_url, stock, status)`)
      .eq('cart_id', cart.id)
    if (error) throw error
    return data
  },

  async addToCart(userId, productId, quantity = 1) {
    const cart = await cartService.getOrCreateCart(userId)
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ cart_id: cart.id, product_id: productId, quantity }])
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  async updateCartItemQuantity(itemId, quantity) {
    if (quantity <= 0) {
      return cartService.removeFromCart(itemId)
    }
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async removeFromCart(itemId) {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
    if (error) throw error
  },

  async clearCart(userId) {
    const cart = await cartService.getOrCreateCart(userId)
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id)
    if (error) throw error
  },
}
