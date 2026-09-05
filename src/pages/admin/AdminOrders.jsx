import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'
import { orderService } from '../../services/orderService'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import Pagination from '../../components/common/Pagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES, ADMIN_ITEMS_PER_PAGE } from '../../utils/constants'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [cancelDialog, setCancelDialog] = useState({ open: false, order: null })
  const [cancelLoading, setCancelLoading] = useState(false)

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count } = await orderService.getAllOrders({
        search,
        status: statusFilter,
        page,
        limit: ADMIN_ITEMS_PER_PAGE,
      })
      setOrders(data || [])
      setTotal(count || 0)
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (err) {
      toast.error('Failed to update order status')
    }
  }

  const handleCancelConfirm = async () => {
    if (!cancelDialog.order) return
    setCancelLoading(true)
    try {
      await orderService.updateOrderStatus(cancelDialog.order.id, 'cancelled')
      toast.success('Order cancelled successfully')
      setCancelDialog({ open: false, order: null })
      fetchOrders()
    } catch (err) {
      toast.error('Failed to cancel order')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Orders</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage and track all customer purchases ({total} total)</p>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <div className="admin-table-title">Order Records</div>
          <div className="admin-table-actions">
            <div className="admin-search">
              <Search size={14} className="admin-search-icon" />
              <input
                placeholder="Search order # or customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-8)' }}>
                    No orders match your search criteria
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.full_name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                        {order.city}, {order.state}
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                      {order.phone || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                      {formatDateTime(order.created_at)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {formatPrice(order.total_amount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="form-select"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: 'var(--text-xs)',
                          width: 'auto',
                          fontWeight: 600,
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="action-btn action-btn-view"
                          title="View Order Details"
                        >
                          <Eye size={14} />
                        </Link>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => setCancelDialog({ open: true, order })}
                            className="action-btn action-btn-delete"
                            title="Cancel Order"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 'var(--space-4)' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, order: null })}
        onConfirm={handleCancelConfirm}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${cancelDialog.order?.order_number}?`}
        confirmText="Cancel Order"
        confirmVariant="btn-danger"
        loading={cancelLoading}
      />
    </div>
  )
}

export default AdminOrders
