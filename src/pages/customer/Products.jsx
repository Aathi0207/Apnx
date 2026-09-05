import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SortAsc, X } from 'lucide-react'
import ProductGrid from '../../components/customer/ProductGrid'
import Pagination from '../../components/common/Pagination'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { PRODUCTS_PER_PAGE } from '../../utils/constants'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const page = parseInt(searchParams.get('page') || '1')
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count } = await productService.getProducts({ search, categoryId, minPrice, maxPrice, sortBy, sortOrder, page, limit: PRODUCTS_PER_PAGE })
      setProducts(data || [])
      setTotalCount(count || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [search, categoryId, minPrice, maxPrice, sortBy, sortOrder, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { categoryService.getCategories().then(setCategories).catch(() => {}) }, [])

  const clearFilters = () => setSearchParams(new URLSearchParams())

  const hasFilters = search || categoryId || minPrice || maxPrice

  return (
    <div className="container section">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">All Products</h1>
          <p className="section-subtitle">{loading ? 'Loading...' : `${totalCount} products found`}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={14} /> Clear Filters</button>}
          <select className="form-select" style={{ width: 'auto' }} value={`${sortBy}-${sortOrder}`}
            onChange={e => { const [sb, so] = e.target.value.split('-'); setParam('sortBy', sb); const p = new URLSearchParams(searchParams); p.set('sortBy', sb); p.set('sortOrder', so); p.set('page','1'); setSearchParams(p) }}>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)} style={{ display: 'none' }}>
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="products-layout">
        {/* Filters Sidebar */}
        <aside className="filters-panel">
          <div className="filter-section">
            <div className="filter-title">Search</div>
            <div style={{ position: 'relative' }}>
              <input type="text" className="form-input" placeholder="Search products..." defaultValue={search}
                onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)} />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Categories</div>
            <div className="filter-options">
              <label className="filter-option">
                <input type="radio" name="cat" checked={!categoryId} onChange={() => setParam('category', '')} />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="filter-option">
                  <input type="radio" name="cat" checked={categoryId === cat.id} onChange={() => setParam('category', cat.id)} />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Price Range</div>
            <div className="filter-price-row">
              <input type="number" className="form-input" placeholder="Min ₹" defaultValue={minPrice} min="0"
                onBlur={e => setParam('minPrice', e.target.value)} style={{ fontSize: 'var(--text-sm)' }} />
              <span style={{ color: 'var(--gray-400)' }}>—</span>
              <input type="number" className="form-input" placeholder="Max ₹" defaultValue={maxPrice} min="0"
                onBlur={e => setParam('maxPrice', e.target.value)} style={{ fontSize: 'var(--text-sm)' }} />
            </div>
          </div>
        </aside>

        {/* Products */}
        <div>
          <ProductGrid products={products} loading={loading} emptyMessage="Try adjusting your search or filters." />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => setParam('page', p)} />
        </div>
      </div>
    </div>
  )
}

export default Products
