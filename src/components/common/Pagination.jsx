import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left = Math.max(1, currentPage - delta)
  const right = Math.min(totalPages, currentPage + delta)

  if (left > 1) { pages.push(1); if (left > 2) pages.push('...') }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages) }

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--gray-400)', padding: '0 var(--space-1)' }}>…</span>
        ) : (
          <button key={page} className={`page-btn ${page === currentPage ? 'active' : ''}`} onClick={() => onPageChange(page)}>
            {page}
          </button>
        )
      )}
      <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default Pagination
