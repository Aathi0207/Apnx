import Modal from './Modal'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, confirmText = 'Confirm', confirmVariant = 'btn-danger', loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="modal-body">
        <p style={{ color: 'var(--gray-600)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${confirmVariant}`} onClick={onConfirm} disabled={loading}>
          {loading ? <><span className="spinner spinner-sm" /> Processing...</> : confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
