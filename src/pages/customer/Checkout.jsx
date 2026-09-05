import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, Lock } from 'lucide-react'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import { formatPrice } from '../../utils/formatters'
import { PAYMENT_METHODS } from '../../utils/constants'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const shipping = cartTotal >= 50 ? 0 : 4.99
  const total = cartTotal + shipping

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.postalCode.trim()) e.postalCode = 'Postal code is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      const order = await orderService.createOrder({
        userId: user.id,
        items: cartItems,
        shippingInfo: form,
        paymentMethod,
        totalAmount: total,
      })
      await clearCart()
      navigate(`/order-success/${order.order_number}`)
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })) }

  if (cartItems.length === 0) { navigate('/cart'); return null }

  return (
    <div className="container section">
      <h1 className="section-title" style={{ marginBottom: 'var(--space-8)' }}>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* Shipping Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card">
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Truck size={20} color="var(--primary)" /> Shipping Information
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className={`form-input ${errors.fullName ? 'error' : ''}`} value={form.fullName} onChange={set('fullName')} placeholder="John Doe" />
                    {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className={`form-input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
                    {errors.phone && <div className="form-error">{errors.phone}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className={`form-input ${errors.address ? 'error' : ''}`} value={form.address} onChange={set('address')} placeholder="123 Main Street, Apt 4B" />
                  {errors.address && <div className="form-error">{errors.address}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className={`form-input ${errors.city ? 'error' : ''}`} value={form.city} onChange={set('city')} placeholder="New York" />
                    {errors.city && <div className="form-error">{errors.city}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province *</label>
                    <input className={`form-input ${errors.state ? 'error' : ''}`} value={form.state} onChange={set('state')} placeholder="NY" />
                    {errors.state && <div className="form-error">{errors.state}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code *</label>
                  <input className={`form-input ${errors.postalCode ? 'error' : ''}`} value={form.postalCode} onChange={set('postalCode')} placeholder="10001" style={{ maxWidth: 200 }} />
                  {errors.postalCode && <div className="form-error">{errors.postalCode}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Order Notes (Optional)</label>
                  <textarea className="form-textarea" value={form.notes} onChange={set('notes')} placeholder="Special delivery instructions..." rows={3} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CreditCard size={20} color="var(--primary)" /> Payment Method
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: `2px solid ${paymentMethod === pm.value ? 'var(--primary)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'var(--transition)', background: paymentMethod === pm.value ? 'rgba(99,102,241,.05)' : '#fff' }}>
                    <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)} style={{ accentColor: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600 }}>{pm.label}</span>
                    {pm.value === 'cod' && <Truck size={16} style={{ marginLeft: 'auto', color: 'var(--gray-400)' }} />}
                    {pm.value === 'mock_card' && <CreditCard size={16} style={{ marginLeft: 'auto', color: 'var(--gray-400)' }} />}
                  </label>
                ))}
                {paymentMethod === 'mock_card' && (
                  <div style={{ padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                    <strong>Demo Mode:</strong> No real payment will be processed. Use any card details.
                    <div className="form-row" style={{ marginTop: 'var(--space-3)' }}>
                      <input className="form-input" placeholder="Card Number: 4242 4242 4242 4242" readOnly />
                      <input className="form-input" placeholder="MM/YY: 12/28" readOnly />
                    </div>
                    <input className="form-input" placeholder="CVV: 123" readOnly style={{ maxWidth: 120, marginTop: 'var(--space-2)' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary" style={{ height: 'fit-content', position: 'sticky', top: 80 }}>
            <h3>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {cartItems.map(item => {
                if (!item.products) return null
                const price = item.products.discount_price || item.products.price
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
                      <ImageWithFallback src={item.products.image_url} alt={item.products.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, fontSize: 'var(--text-sm)' }}>
                      <div style={{ fontWeight: 600, lineHeight: 1.3 }}>{item.products.name}</div>
                      <div style={{ color: 'var(--gray-500)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{formatPrice(price * item.quantity)}</div>
                  </div>
                )
              })}
            </div>
            <div className="divider" />
            <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : formatPrice(shipping)}</span></div>
            <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 'var(--space-5)' }}>
              {loading ? <><span className="spinner spinner-sm" /> Placing Order...</> : <><Lock size={16} /> Place Order</>}
            </button>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
              Your data is secure and encrypted.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
