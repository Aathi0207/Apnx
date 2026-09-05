const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton skeleton-line" style={{ width: '60%' }} />
      <div className="skeleton skeleton-line" style={{ width: '90%' }} />
      <div className="skeleton skeleton-line" style={{ width: '40%' }} />
      <div className="skeleton skeleton-btn" />
    </div>
  </div>
)

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="products-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)

export default SkeletonCard
