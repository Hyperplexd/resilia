import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, type Role } from './AuthContext'

export default function RequireRole({
  role,
  children,
}: {
  role: Role
  children: ReactElement
}) {
  const { role: activeRole } = useAuth()

  if (activeRole !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
