import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default AdminRoute
