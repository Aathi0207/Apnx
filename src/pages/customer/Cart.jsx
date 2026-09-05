import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import EmptyState from '../../components/common/EmptyState'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../utils/formatters'

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) return (
    <div className="container section">
      <EmptyState icon={<ShoppingBag size={56} />} title="Please Sign In"
        description="You need to be logged in to view your cart."
        action={<Link to="/login" className="btn btn-primary">Sign In</Link>} />
    </div>
  )

  if (loading) return <div className="container section"><div className="loading-center"><div className="spinner" /></div></div>

  if (cartItems.length === 0) return (
    <div className="container section">
      <EmptyState icon={<ShoppingBag size={56} />} title="Your Cart is Empty"
        description="Browse our products and add something you love."
        action={<Link to="/products" className="btn btn-primary">Continue Shopping</Link>} />
    </div>
  )

  const shipping = cartTotal >= 50 ? 0 : 4.99
  const total = cartTotal + shipping

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
        <h1 className="section-title" style={{ margin: 0 }}>Shopping Cart</h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="card">
          {cartItems.map(item => {
            if (!item.products) return null
            const price = item.products.discount_price || item.products.price
            return (
              <div key={item.id} className="cart-item-row">
                <Link to={`/products/${item.products.id}`} className="cart-item-img">
                  <ImageWithFallback src={item.products.image_url} alt={item.products.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item.products.id}`} className="cart-item-name">{item.products.name}</Link>
                  <div className="cart-item-price">{formatPrice(price)} each</div>
                  {item.products.status === 'inactive' && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>This product is no longer available</span>}
                </div>
                <div className="cart-item-controls">
                  <div className="qty-selector">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.products.stock)}><Minus size={14} /></button>
                    <span className="qty-value" style={{ fontSize: 'var(--text-sm)' }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.products.stock)} disabled={item.quantity >= item.products.stock}><Plus size={14} /></button>
                  </div>
                  <div className="cart-item-total">{formatPrice(price * item.quantity)}</div>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)} title="Remove item"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : formatPrice(shipping)}</span></div>
          {shipping > 0 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-3)' }}>Add {formatPrice(50 - cartTotal)} more for free shipping</div>}
          <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')} style={{ marginTop: 'var(--space-4)' }}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: 'var(--space-2)', justifyContent: 'center' }}>
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Cart
