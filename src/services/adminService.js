import { supabase } from './supabase'

export const adminService = {
  async getDashboardStats() {
    const [products, orders, customers, revenue, pendingOrders, recentOrders] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select(`*, profiles(full_name)`).order('created_at', { ascending: false }).limit(5),
    ])

    const totalRevenue = (revenue.data || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

    return {
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalCustomers: customers.count || 0,
      totalRevenue,
      pendingOrders: pendingOrders.count || 0,
      recentOrders: recentOrders.data || [],
    }
  },

  async getTopProducts(limit = 5) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`product_id, quantity, products(id, name, image_url, price)`)
      .limit(200)

    if (error) throw error

    const totals = {}
    for (const item of data || []) {
      if (!item.products) continue
      const pid = item.product_id
      if (!totals[pid]) totals[pid] = { ...item.products, totalSold: 0 }
      totals[pid].totalSold += item.quantity
    }

    return Object.values(totals)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)
  },

  async getRevenueByMonth() {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })

    if (error) throw error

    const monthly = {}
    for (const order of data || []) {
      const month = order.created_at.substring(0, 7)
      monthly[month] = (monthly[month] || 0) + (order.total_amount || 0)
    }

    return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }))
  },

  async getCustomers({ search = '', page = 1, limit = 20 } = {}) {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')

    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  async getCustomerById(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async updateCustomerStatus(id, isActive) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getCustomerOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, products(id, name))`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}
