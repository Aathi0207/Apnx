import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Phone, MapPin, Package, Calendar, CreditCard, Clock, Check } from 'lucide-react'
import { orderService } from '../../services/orderService'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES } from '../../utils/constants'
import toast from 'react-hot-toast'

const AdminOrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await orderService.getAdminOrderById(id)
      setOrder(data)
      setSelectedStatus(data.status)
    } catch (err) {
      toast.error('Failed to load order details')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) return
    setUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, selectedStatus)
      toast.success(`Order status updated to ${selectedStatus}`)
      fetchOrder()
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!order) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <button onClick={() => navigate('/admin/orders')} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Back to Orders
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Order Details</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p style={{ color: 'var(--gray-500)', marginTop: 2, fontFamily: 'monospace' }}>
            #{order.order_number}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left column: Order items & breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status Management card */}
          <div className="admin-form-card">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Update Order Status
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ maxWidth: 240 }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === order.status}
              >
                {updating ? <span className="spinner spinner-sm" /> : <Check size={16} />}
                Update Status
              </button>
            </div>
            <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
              Changing order status will automatically update in customer's "My Orders" view.
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div className="admin-table-title">Ordered Items ({order.order_items?.length || 0})</div>
            </div>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.order_items || []).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ width: 50, height: 50, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-200)' }}>
                            <ImageWithFallback
                              src={item.products?.image_url}
                              alt={item.products?.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                              {item.products?.name || 'Product'}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                              ID: {item.product_id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.unit_price)}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {formatPrice(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div style={{ padding: 'var(--space-5)', borderTop: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.total_amount >= 50 ? order.total_amount : Math.max(0, order.total_amount - 4.99))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                    <span>Shipping:</span>
                    <span>{order.total_amount >= 50 ? 'FREE' : '$4.99'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--primary-dark)', borderTop: '1px solid var(--gray-300)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    <span>Grand Total:</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="admin-form-card">
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Customer Notes</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', fontStyle: 'italic', background: 'var(--gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius)' }}>
                "{order.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right column: Customer info & delivery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Customer info */}
          <div className="admin-form-card">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={18} color="var(--primary)" /> Customer Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Customer Name</div>
                <div style={{ fontWeight: 600 }}>{order.full_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Phone Number</div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <Phone size={14} color="var(--gray-400)" /> {order.phone}
                </div>
              </div>
              {order.profiles && (
                <div>
                  <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Registered Account</div>
                  <div style={{ fontWeight: 600 }}>{order.profiles.full_name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="admin-form-card">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <MapPin size={18} color="var(--primary)" /> Shipping Address
            </h3>
            <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600 }}>{order.full_name}</div>
              <div style={{ color: 'var(--gray-600)' }}>{order.address}</div>
              <div style={{ color: 'var(--gray-600)' }}>
                {order.city}, {order.state} {order.postal_code}
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="admin-form-card">
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CreditCard size={18} color="var(--primary)" /> Payment & Order Meta
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              <div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Payment Method</div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Mock Card Payment'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Order Placed</div>
                <div style={{ fontWeight: 600 }}>{formatDateTime(order.created_at)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>Last Updated</div>
                <div style={{ fontWeight: 600 }}>{formatDateTime(order.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetails
