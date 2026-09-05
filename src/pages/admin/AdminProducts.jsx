import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import OrderStatusBadge from '../../components/common/OrderStatusBadge'
import { formatPrice, formatDate } from '../../utils/formatters'
import { ADMIN_ITEMS_PER_PAGE } from '../../utils/constants'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count } = await productService.getAllProducts({ search, categoryId: categoryFilter, status: statusFilter, page, limit: ADMIN_ITEMS_PER_PAGE })
      setProducts(data || [])
      setTotal(count || 0)
    } catch (err) { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [search, categoryFilter, statusFilter, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { categoryService.getAllCategories().then(setCategories).catch(() => {}) }, [])

  const handleToggleStatus = async (product) => {
    try {
      await productService.updateProduct(product.id, { status: product.status === 'active' ? 'inactive' : 'active' })
      toast.success('Product status updated')
      fetchProducts()
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async () => {
    if (!deleteDialog.product) return
    setDeleteLoading(true)
    try {
      await productService.deleteProduct(deleteDialog.product.id)
      toast.success('Product deleted')
      setDeleteDialog({ open: false, product: null })
      fetchProducts()
    } catch { toast.error('Failed to delete product') }
    finally { setDeleteLoading(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Products</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>{total} products total</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary"><Plus size={16} /> Add Product</Link>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <div className="admin-table-title">All Products</div>
          <div className="admin-table-actions">
            <div className="admin-search">
              <Search size={14} className="admin-search-icon" />
              <input placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="admin-filter-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="admin-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-10)' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-8)' }}>No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-200)' }}>
                        <ImageWithFallback src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', fontFamily: 'monospace' }}>{p.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-active" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>{p.categories?.name || '—'}</span></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{formatPrice(p.discount_price || p.price)}</div>
                    {p.discount_price && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', textDecoration: 'line-through' }}>{formatPrice(p.price)}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--danger)' : p.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>{p.stock}</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={p.status === 'active'} onChange={() => handleToggleStatus(p)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{formatDate(p.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button onClick={() => navigate(`/admin/products/edit/${p.id}`)} className="action-btn action-btn-edit" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => setDeleteDialog({ open: true, product: p })} className="action-btn action-btn-delete" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 'var(--space-4)' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="btn-danger"
        loading={deleteLoading}
      />
    </div>
  )
}

export default AdminProducts
