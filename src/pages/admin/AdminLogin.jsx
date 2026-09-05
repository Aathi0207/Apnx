import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const { signIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const { user } = await signIn({ email: form.email, password: form.password })
      // Profile is fetched by AuthContext; check role after short delay
      setTimeout(() => {
        // Re-read isAdmin from context after profile loads
        navigate('/admin')
      }, 300)
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-logo-text">ShopSphere</div>
          <div className="admin-login-title">Admin Portal</div>
          <div className="admin-login-subtitle">Authorized personnel only</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="admin@shopsphere.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
            {loading ? <><span className="spinner spinner-sm" /> Authenticating...</> : <><ShieldCheck size={18} /> Sign In as Admin</>}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(255,255,255,.04)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,.08)', fontSize: 'var(--text-xs)', color: '#64748b', textAlign: 'center' }}>
          Admin accounts must be configured in the database. Contact system administrator if you need access.
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
