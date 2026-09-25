import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function RequireRole({ role, children }) {
  const { role: currentRole, user, loading } = useUser()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (currentRole !== role) return <Navigate to="/" replace />
  if (role === 'student' && (!user.rollNo || !user.roomNo)) return <Navigate to="/student/identify" replace />
  return children
}
