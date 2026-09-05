const LoadingSpinner = ({ fullPage = false, size = 'md', text = '' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''

  if (fullPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div className={`spinner ${sizeClass}`} />
        {text && <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{text}</p>}
      </div>
    )
  }

  return (
    <div className="loading-center">
      <div className={`spinner ${sizeClass}`} />
      {text && <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{text}</p>}
    </div>
  )
}

export default LoadingSpinner
