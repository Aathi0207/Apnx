import { Link } from 'react-router-dom'

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-8)', background: 'var(--gray-50)' }}>
    <div style={{ fontSize: '8rem', lineHeight: 1, marginBottom: 'var(--space-4)' }}>404</div>
    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>😕</div>
    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--gray-900)' }}>Page Not Found</h1>
    <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-8)', maxWidth: 400, lineHeight: 1.7 }}>
      The page you're looking for doesn't exist or has been moved. Let's get you back on track.
    </p>
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
      <Link to="/products" className="btn btn-outline btn-lg">Browse Products</Link>
    </div>
  </div>
)

export default NotFound
