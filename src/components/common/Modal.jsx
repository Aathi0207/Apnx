import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxWidths = { sm: '400px', md: '500px', lg: '700px', xl: '900px' }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: maxWidths[size] || maxWidths.md }} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
