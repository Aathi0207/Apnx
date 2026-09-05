import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, ArrowLeft, Save, X } from 'lucide-react'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { storageService } from '../../services/storageService'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount_price: '',
    category_id: '', stock: '', image_url: '', status: 'active',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories).catch(() => {})
    if (isEdit && id) {
      productService.getProductById(id)
        .then(p => {
          setForm({
            name: p.name || '', description: p.description || '',
            price: p.price || '', discount_price: p.discount_price || '',
            category_id: p.category_id || '', stock: p.stock || 0,
            image_url: p.image_url || '', status: p.status || 'active',
          })
          setImagePreview(p.image_url)
        })
        .catch(() => navigate('/admin/products'))
        .finally(() => setFetchLoading(false))
    }
  }, [id, isEdit, navigate])

  const set = (f) => (e) => { setForm(x => ({ ...x, [f]: e.target.value })); setErrors(er => ({ ...er, [f]: '' })) }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors(er => ({ ...er, image: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) e.price = 'Valid price is required'
    if (form.discount_price && (isNaN(parseFloat(form.discount_price)) || parseFloat(form.discount_price) >= parseFloat(form.price))) e.discount_price = 'Discount price must be less than original price'
    if (!form.category_id) e.category_id = 'Category is required'
    if (form.stock === '' || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) e.stock = 'Valid stock quantity is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      let imageUrl = form.image_url
      if (imageFile) {
        imageUrl = await storageService.uploadProductImage(imageFile)
      }
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        category_id: form.category_id,
        stock: parseInt(form.stock),
        image_url: imageUrl,
        status: form.status,
      }
      if (isEdit) {
        await productService.updateProduct(id, payload)
        toast.success('Product updated successfully!')
      } else {
        await productService.createProduct(payload)
        toast.success('Product created successfully!')
      }
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <LoadingSpinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <button onClick={() => navigate('/admin/products')} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</button>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 2 }}>{isEdit ? 'Update product information' : 'Create a new product listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Main Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="admin-form-card">
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Basic Information</div>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Wireless Earbuds Pro" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Describe the product..." rows={5} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category_id} onChange={set('category_id')}>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <div className="form-error">{errors.category_id}</div>}
              </div>
            </div>

            <div className="admin-form-card">
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Pricing & Stock</div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Original Price ($) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price ($)</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.discount_price} onChange={set('discount_price')} placeholder="0.00 (optional)" />
                  {errors.discount_price && <div className="form-error">{errors.discount_price}</div>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Quantity *</label>
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
                  {errors.stock && <div className="form-error">{errors.stock}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="admin-form-card">
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Product Image</div>
              <label className={`image-upload-area ${imagePreview ? 'has-image' : ''}`}>
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" className="image-upload-preview" />
                    <button type="button" onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: '' })) }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <Upload size={32} style={{ margin: '0 auto var(--space-3)', color: 'var(--gray-300)' }} />
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>Click to upload image</p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>PNG, JPG, WebP up to 5MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              {form.image_url && !imageFile && (
                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', wordBreak: 'break-all' }}>
                  Or use URL: <input className="form-input" value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }} style={{ marginTop: 4 }} />
                </div>
              )}
              {!imagePreview && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={form.image_url} onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); if (e.target.value) setImagePreview(e.target.value) }} placeholder="https://..." />
                </div>
              )}
            </div>

            <div className="admin-form-card">
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {['active', 'inactive'].map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    <input type="radio" name="status" value={s} checked={form.status === s} onChange={set('status')} style={{ accentColor: 'var(--primary)' }} />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === 'active' ? <span className="badge badge-active" style={{ marginLeft: 4 }}>Visible</span> : <span className="badge badge-inactive" style={{ marginLeft: 4 }}>Hidden</span>}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Update Product' : 'Create Product'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export const AddProduct = () => <ProductForm isEdit={false} />
export const EditProduct = () => <ProductForm isEdit={true} />
export default ProductForm
