import ProductCard from './ProductCard'
import { SkeletonGrid } from '../common/SkeletonCard'
import EmptyState from '../common/EmptyState'
import { PackageSearch } from 'lucide-react'

const ProductGrid = ({ products, loading, emptyMessage = 'No products found' }) => {
  if (loading) return <SkeletonGrid count={8} />

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch size={56} />}
        title="No Products Found"
        description={emptyMessage}
      />
    )
  }

  return (
    <div className="products-grid">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}

export default ProductGrid
