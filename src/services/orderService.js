import { supabase } from './supabase'

const generateOrderNumber = () => {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let rand = ''
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)]
  return `ORD-${y}${m}${d}-${rand}`
}

export const orderService = {
  async createOrder({ userId, items, shippingInfo, paymentMethod, totalAmount }) {
    const orderNumber = generateOrderNumber()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: userId,
        status: 'pending',
        total_amount: totalAmount,
        payment_method: paymentMethod,
        full_name: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postal_code: shippingInfo.postalCode,
        notes: shippingInfo.notes || '',
      }])
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      unit_price: item.products.discount_price || item.products.price,
      total_price: (item.products.discount_price || item.products.price) * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    return order
  },

  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, products(id, name, image_url))`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getOrderById(orderId, userId = null) {
    let query = supabase
      .from('orders')
      .select(`*, order_items(*, products(id, name, image_url, price))`)
      .eq('id', orderId)

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query.single()
    if (error) throw error
    return data
  },

  async getOrderByNumber(orderNumber, userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, products(id, name, image_url, price))`)
      .eq('order_number', orderNumber)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  },

  // Admin methods
  async getAllOrders({ search = '', status = '', page = 1, limit = 20 } = {}) {
    let query = supabase
      .from('orders')
      .select(`*, profiles(full_name, phone)`, { count: 'exact' })

    if (search) query = query.or(`order_number.ilike.%${search}%,full_name.ilike.%${search}%`)
    if (status) query = query.eq('status', status)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAdminOrderById(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, products(id, name, image_url, price)), profiles(full_name, phone)`)
      .eq('id', orderId)
      .single()
    if (error) throw error
    return data
  },
}
