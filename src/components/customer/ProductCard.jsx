import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import ImageWithFallback from '../common/ImageWithFallback'
import { useCart } from '../../context/CartContext'
import { formatPrice, getDiscountPercentage } from '../../utils/formatters'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const isOutOfStock = product.stock === 0
  const discount = getDiscountPercentage(product.price, product.discount_price)
  const currentPrice = product.discount_price || product.price

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image">
        <ImageWithFallback src={product.image_url} alt={product.name} />
        {discount > 0 && <span className="product-card-badge">-{discount}%</span>}
        {isOutOfStock && (
          <div className="product-card-out-of-stock">
            <span>Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-category">{product.categories?.name}</div>
        <Link to={`/products/${product.id}`} className="product-card-name">{product.name}</Link>

        <div className="product-card-price">
          <span className="product-card-current-price">{formatPrice(currentPrice)}</span>
          {discount > 0 && <span className="product-card-original-price">{formatPrice(product.price)}</span>}
        </div>

        <div className="product-card-footer">
          <button
            className="product-card-btn primary"
            disabled={isOutOfStock}
            onClick={() => addToCart(product.id, 1, product.stock)}
          >
            <ShoppingCart size={14} style={{ marginRight: 4 }} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            className="product-card-btn outline"
            onClick={() => navigate(`/products/${product.id}`)}
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
