import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (f) => (e) => { setForm(x => ({ ...x, [f]: e.target.value })); setErrors(x => ({ ...x, [f]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone })
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✨</div>
        <h2>Join ShopSphere</h2>
        <p>Create a free account and start enjoying exclusive deals, fast checkout, and personalized shopping.</p>
        <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {['Free account forever', 'Exclusive member discounts', 'Order history & tracking', 'Priority customer support'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-4)', overflowY: 'auto' }}>
        <div className="auth-form-side" style={{ position: 'static', padding: 0 }}>
          <div className="auth-logo">ShopSphere</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">It's free and takes less than a minute</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-row" style={{ margin: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={form.fullName} onChange={set('fullName')} />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone (optional)</label>
                <input className="form-input" placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Creating Account...</> : 'Create Account'}
            </button>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', textAlign: 'center' }}>
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></div>
        </div>
      </div>
    </div>
  )
}

export default Register
