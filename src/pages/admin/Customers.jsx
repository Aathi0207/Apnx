import { useState, useEffect, useCallback } from 'react'
import { Search, User, Phone, Calendar, ShoppingBag, Eye, ShieldCheck, ShieldAlert } from 'lucide-react'
import { adminService } from '../../services/adminService'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatDate, formatDateTime, formatPrice } from '../../utils/formatters'
import { ADMIN_ITEMS_PER_PAGE } from '../../utils/constants'
import toast from 'react-hot-toast'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Customer orders modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count } = await adminService.getCustomers({
        search,
        page,
        limit: ADMIN_ITEMS_PER_PAGE,
      })
      setCustomers(data || [])
      setTotal(count || 0)
    } catch (err) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.is_active
    try {
      await adminService.updateCustomerStatus(customer.id, newStatus)
      toast.success(`Customer account ${newStatus ? 'enabled' : 'disabled'}`)
      fetchCustomers()
    } catch (err) {
      toast.error('Failed to update customer status')
    }
  }

  const handleViewOrders = async (customer) => {
    setSelectedCustomer(customer)
    setIsOrdersModalOpen(true)
    setOrdersLoading(true)
    try {
      const orders = await adminService.getCustomerOrders(customer.id)
      setCustomerOrders(orders || [])
    } catch (err) {
      toast.error("Failed to load customer's orders")
    } finally {
      setOrdersLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Customers</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
            Manage registered user accounts and order histories ({total} customers)
          </p>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <div className="admin-table-title">Registered Customer Profiles</div>
          <div className="admin-table-actions">
            <div className="admin-search">
              <Search size={14} className="admin-search-icon" />
              <input
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-8)' }}>
                    No registered customers found
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 'var(--text-sm)',
                            flexShrink: 0,
                          }}
                        >
                          {(cust.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{cust.full_name || 'Anonymous User'}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                            ID: {cust.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                      {cust.phone || '—'}
                    </td>
                    <td>
                      <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>
                        {cust.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                      {formatDate(cust.created_at)}
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={cust.is_active}
                          onChange={() => handleToggleStatus(cust)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewOrders(cust)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ShoppingBag size={14} /> Orders
                      </button>
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

      {/* Customer Orders Modal */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        title={`Orders by ${selectedCustomer?.full_name || 'Customer'}`}
        size="lg"
      >
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {ordersLoading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : customerOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-400)' }}>
              This customer hasn't placed any orders yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--space-4)',
                    background: 'var(--gray-50)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {ord.order_number}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginLeft: 'var(--space-2)' }}>
                        {formatDateTime(ord.created_at)}
                      </span>
                    </div>
                    <OrderStatusBadge status={ord.status} />
                  </div>

                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', marginBottom: 'var(--space-2)' }}>
                    {ord.order_items?.map((it) => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {it.products?.name || 'Product'} × {it.quantity}</span>
                        <span>{formatPrice(it.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                    <span>Order Total:</span>
                    <span style={{ color: 'var(--primary-dark)' }}>{formatPrice(ord.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setIsOrdersModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Customers
