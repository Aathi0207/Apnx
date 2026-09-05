import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Users, DollarSign, Clock, TrendingUp, Eye } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminService } from '../../services/adminService'
import { formatPrice, formatDate } from '../../utils/formatters'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: `${color}20` }}>
      <Icon size={22} color={color} />
    </div>
    <div className="stat-card-info">
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && <div className={`stat-card-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>}
    </div>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getTopProducts(5),
      adminService.getRevenueByMonth(),
    ]).then(([s, top, rev]) => {
      setStats(s)
      setTopProducts(top)
      setRevenueData(rev.slice(-6))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>Dashboard</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="stat-cards-grid">
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts || 0} color="#6366f1" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} color="#f59e0b" />
        <StatCard icon={Users} label="Customers" value={stats?.totalCustomers || 0} color="#10b981" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} color="#3b82f6" />
        <StatCard icon={Clock} label="Pending Orders" value={stats?.pendingOrders || 0} color="#ef4444" />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Revenue Overview</div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>No revenue data yet</div>}
        </div>

        <div className="chart-card">
          <div className="chart-title">Top Products</div>
          {topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topProducts.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{p.totalSold} sold</div>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary-dark)' }}>{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 'var(--space-8)' }}>No sales data yet</div>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-table-card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="admin-table-header">
          <div className="admin-table-title">Recent Orders</div>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrders || []).length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-8)' }}>No orders yet</td></tr>
              ) : (stats?.recentOrders || []).map(order => (
                <tr key={order.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--text-xs)' }}>{order.order_number}</span></td>
                  <td>{order.profiles?.full_name || order.full_name}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td style={{ fontWeight: 700 }}>{formatPrice(order.total_amount)}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="action-btn action-btn-view" title="View Order">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
