import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

// Wrap a route's element with this so someone can't jump straight to
// /staff or /admin (or /student before entering roll+room number)
// by typing the URL directly.
export default function RequireRole({ role, children }) {
  const { role: currentRole, student } = useUser()

  if (currentRole !== role) {
    return <Navigate to="/" replace />
  }
  if (role === 'student' && (!student.rollNo || !student.roomNo)) {
    return <Navigate to="/student/identify" replace />
  }
  return children
}
