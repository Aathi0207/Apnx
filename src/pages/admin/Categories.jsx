import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag, Search, Check, X } from 'lucide-react'
import { categoryService } from '../../services/categoryService'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { slugify, formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true,
  })
  const [errors, setErrors] = useState({})

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data || [])
    } catch (err) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAddModal = () => {
    setEditingCategory(null)
    setForm({ name: '', slug: '', description: '', is_active: true })
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      is_active: cat.is_active,
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slugify(name),
    }))
    setErrors((prev) => ({ ...prev, name: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Category name is required'
    if (!form.slug.trim()) errs.slug = 'Category slug is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          is_active: form.is_active,
        })
        toast.success('Category updated successfully')
      } else {
        await categoryService.createCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          is_active: form.is_active,
        })
        toast.success('Category created successfully')
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (cat) => {
    try {
      await categoryService.updateCategory(cat.id, { is_active: !cat.is_active })
      toast.success(`Category ${!cat.is_active ? 'enabled' : 'disabled'}`)
      fetchCategories()
    } catch (err) {
      toast.error('Failed to update category status')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.category) return
    setDeleteLoading(true)
    try {
      await categoryService.deleteCategory(deleteDialog.category.id)
      toast.success('Category deleted successfully')
      setDeleteDialog({ open: false, category: null })
      fetchCategories()
    } catch (err) {
      toast.error(err.message || 'Failed to delete category (might have linked products)')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Categories</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Manage product categories and catalog structure</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <div className="admin-table-title">All Categories ({categories.length})</div>
          <div className="admin-table-actions">
            <div className="admin-search">
              <Search size={14} className="admin-search-icon" />
              <input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-8)' }}>
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Tag size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 'var(--text-xs)' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ color: 'var(--gray-600)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={cat.is_active}
                          onChange={() => handleToggleActive(cat)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                      {formatDate(cat.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="action-btn action-btn-edit"
                          title="Edit Category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, category: cat })}
                          className="action-btn action-btn-delete"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Smart Home"
                value={form.name}
                onChange={handleNameChange}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Slug *</label>
              <input
                className="form-input"
                placeholder="e.g. smart-home"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
              {errors.slug && <div className="form-error">{errors.slug}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Short description of products in this category..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                />
                Active (visible on customer website)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner spinner-sm" /> Saving...
                </>
              ) : editingCategory ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteDialog.category?.name}"? Products belonging to this category may be affected.`}
        confirmText="Delete"
        confirmVariant="btn-danger"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Categories
