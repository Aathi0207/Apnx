import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Zap, Plus, Minus, ArrowLeft, Tag } from 'lucide-react'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import ProductGrid from '../../components/customer/ProductGrid'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { productService } from '../../services/productService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, getDiscountPercentage } from '../../utils/formatters'
import { useNavigate as useNav } from 'react-router-dom'
import toast from 'react-hot-toast'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [buyLoading, setBuyLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setQuantity(1)
    productService.getProductById(id)
      .then(p => {
        setProduct(p)
        if (p.category_id) productService.getRelatedProducts(p.category_id, id, 4).then(setRelated).catch(() => {})
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <LoadingSpinner fullPage />
  if (!product) return null

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const discount = getDiscountPercentage(product.price, product.discount_price)
  const currentPrice = product.discount_price || product.price

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity, product.stock)
  }

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return }
    setBuyLoading(true)
    await addToCart(product.id, quantity, product.stock)
    setBuyLoading(false)
    navigate('/cart')
  }

  const changeQty = (delta) => setQuantity(q => Math.max(1, Math.min(product.stock, q + delta)))

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
        <Link to="/" style={{ color: 'var(--gray-500)' }}>Home</Link> /
        <Link to="/products" style={{ color: 'var(--gray-500)' }}>Products</Link> /
        <span style={{ color: 'var(--gray-900)' }}>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* Images */}
        <div className="product-detail-images">
          <div className="product-detail-main-img">
            <ImageWithFallback src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="product-category-tag">{product.categories?.name}</div>
          <h1 className="product-detail-name">{product.name}</h1>

          {/* Stock */}
          <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left!` : `In Stock (${product.stock})`}
          </span>

          {/* Price */}
          <div className="product-price-section" style={{ marginTop: 'var(--space-4)' }}>
            <span className="product-current-price">{formatPrice(currentPrice)}</span>
            {discount > 0 && <>
              <span className="product-original-price">{formatPrice(product.price)}</span>
              <span className="product-discount-tag"><Tag size={12} style={{ display: 'inline' }} /> {discount}% OFF</span>
            </>}
          </div>

          {/* Description */}
          <div className="divider" />
          <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>{product.description}</p>
          <div className="divider" />

          {/* Qty Selector */}
          {!isOutOfStock && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div className="form-label">Quantity</div>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => changeQty(-1)} disabled={quantity <= 1}><Minus size={16} /></button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => changeQty(1)} disabled={quantity >= product.stock}><Plus size={16} /></button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="detail-actions">
            <button className="btn btn-primary btn-lg" disabled={isOutOfStock} onClick={handleAddToCart} style={{ flex: 1 }}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="btn btn-secondary btn-lg" disabled={isOutOfStock || buyLoading} onClick={handleBuyNow} style={{ flex: 1 }}>
              {buyLoading ? <span className="spinner spinner-sm" /> : <Zap size={18} />}
              Buy Now
            </button>
          </div>

          {/* Meta */}
          <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
              <div><span style={{ color: 'var(--gray-500)' }}>Category: </span><strong>{product.categories?.name}</strong></div>
              <div><span style={{ color: 'var(--gray-500)' }}>SKU: </span><strong>SS-{product.id.substring(0, 8).toUpperCase()}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-6)' }}>Related Products</h2>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  )
}

export default ProductDetails
