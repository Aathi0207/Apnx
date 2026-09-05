import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import { orderService } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatDate } from '../../utils/formatters'

const MyOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    orderService.getUserOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="section-title">My Orders</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<Package size={56} />} title="No Orders Yet"
          description="You haven't placed any orders yet. Start shopping!"
          action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />
      ) : (
        <div>
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card" style={{ display: 'block', textDecoration: 'none' }}>
              <div className="order-card-header">
                <div>
                  <div className="order-number">{order.order_number}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>{formatDate(order.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <OrderStatusBadge status={order.status} />
                  <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{formatPrice(order.total_amount)}</span>
                  <ChevronRight size={16} style={{ color: 'var(--gray-400)' }} />
                </div>
              </div>
              <div className="order-card-body">
                <div className="order-products-preview">
                  {(order.order_items || []).slice(0, 4).map(item => (
                    <div key={item.id} className="order-product-thumb">
                      <ImageWithFallback src={item.products?.image_url} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                  {(order.order_items || []).length > 4 && (
                    <div style={{ width: 50, height: 50, borderRadius: 'var(--radius)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-600)' }}>
                      +{order.order_items.length - 4}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                  {(order.order_items || []).length} item{order.order_items?.length !== 1 ? 's' : ''} · {order.city}, {order.state}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
