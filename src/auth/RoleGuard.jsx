import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RoleGuard({ role, children }) {
  const { user } = useAuth()

  if (!user || user.role !== role) {
    return <Navigate to="/dashboard" />
  }

  return children
}
