import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const OrderSuccess = () => {
  const { orderNumber } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !orderNumber) { setLoading(false); return }
    orderService.getOrderByNumber(orderNumber, user.id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderNumber, user])

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="container section" style={{ maxWidth: 640, textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
        <CheckCircle size={40} color="var(--success)" />
      </div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Order Placed!</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-lg)' }}>
        Thank you for your purchase. We've received your order and will process it shortly.
      </p>

      {order && (
        <div className="card" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <div>
                <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Order Number</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>{order.order_number}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Order Date</div>
                <div style={{ fontWeight: 600 }}>{formatDateTime(order.created_at)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Payment Method</div>
                <div style={{ fontWeight: 600 }}>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card (Demo)'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--primary-dark)' }}>{formatPrice(order.total_amount)}</div>
              </div>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ color: 'var(--gray-500)', marginBottom: 4 }}>Delivery Address</div>
              <div style={{ fontWeight: 600 }}>{order.full_name}</div>
              <div style={{ color: 'var(--gray-600)' }}>{order.address}, {order.city}, {order.state} {order.postal_code}</div>
              <div style={{ color: 'var(--gray-600)' }}>{order.phone}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn btn-primary">
          <Package size={16} /> Track My Orders
        </Link>
        <Link to="/products" className="btn btn-outline">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>

      {/* Steps */}
      <div style={{ marginTop: 'var(--space-10)', padding: 'var(--space-5)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
        <p style={{ fontWeight: 600, marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>What happens next?</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
          {['Order Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--gray-200)', color: i === 0 ? '#fff' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              {step}
              {i < 3 && <ArrowRight size={12} style={{ color: 'var(--gray-300)' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
