import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await authService.resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 'var(--space-4)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 'var(--space-10)' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
                  <CheckCircle size={32} color="var(--success)" />
                </div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Check Your Email</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                </p>
                <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--space-5)' }}>ShopSphere</div>
                  <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Forgot Password?</h1>
                  <p style={{ color: 'var(--gray-500)' }}>Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                      <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '2.5rem' }} autoComplete="email" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? <><span className="spinner spinner-sm" /> Sending...</> : 'Send Reset Link'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
                  <Link to="/login" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 600 }}>
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
