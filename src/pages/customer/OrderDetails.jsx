import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, User, Package } from 'lucide-react'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { orderService } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES } from '../../utils/constants'

const OrderDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    orderService.getOrderById(id, user.id)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  if (loading) return <LoadingSpinner fullPage />
  if (!order) return null

  const statusIndex = ORDER_STATUSES.findIndex(s => s.value === order.status)

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        <button onClick={() => navigate('/orders')} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back to Orders</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-8)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status Timeline */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Order Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map((s, i) => {
                  const done = ORDER_STATUSES.findIndex(x => x.value === order.status) >= i && order.status !== 'cancelled'
                  return (
                    <div key={s.value} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--primary)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
                          <span style={{ color: done ? '#fff' : 'var(--gray-400)', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: done ? 'var(--primary)' : 'var(--gray-400)', fontWeight: done ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
                      </div>
                      {i < ORDER_STATUSES.filter(s => s.value !== 'cancelled').length - 1 && (
                        <div style={{ flex: 1, height: 2, background: done ? 'var(--primary)' : 'var(--gray-200)', marginBottom: 20, transition: 'var(--transition)' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <div className="card-header">Order Items ({order.order_items?.length})</div>
            <div className="card-body" style={{ padding: 0 }}>
              {(order.order_items || []).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-200)' }}>
                    <ImageWithFallback src={item.products?.image_url} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.product_id}`} style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>{item.products?.name}</Link>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>{formatPrice(item.unit_price)} × {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{formatPrice(item.total_price)}</div>
                </div>
              ))}
              <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--primary-dark)' }}>
                  <span>Total</span><span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <div className="card-header">Order Info</div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <div><div style={{ color: 'var(--gray-500)' }}>Order Number</div><div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>{order.order_number}</div></div>
              <div><div style={{ color: 'var(--gray-500)' }}>Placed On</div><div style={{ fontWeight: 600 }}>{formatDateTime(order.created_at)}</div></div>
              <div><div style={{ color: 'var(--gray-500)' }}>Payment</div><div style={{ fontWeight: 600 }}>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card (Demo)'}</div></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><MapPin size={16} style={{ display: 'inline', marginRight: 6 }} />Delivery Address</div>
            <div className="card-body" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600 }}><User size={14} style={{ display: 'inline', marginRight: 4 }} />{order.full_name}</div>
              <div style={{ color: 'var(--gray-600)' }}><Phone size={14} style={{ display: 'inline', marginRight: 4 }} />{order.phone}</div>
              <div style={{ color: 'var(--gray-600)', marginTop: 4 }}>{order.address}</div>
              <div style={{ color: 'var(--gray-600)' }}>{order.city}, {order.state} {order.postal_code}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
