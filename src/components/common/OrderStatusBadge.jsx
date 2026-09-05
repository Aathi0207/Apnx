import { ORDER_STATUSES } from '../../utils/constants'

const OrderStatusBadge = ({ status }) => {
  const s = ORDER_STATUSES.find(o => o.value === status) || { label: status, color: '#6b7280' }
  const cls = `badge badge-${status}`
  return <span className={cls}>{s.label}</span>
}

export default OrderStatusBadge
