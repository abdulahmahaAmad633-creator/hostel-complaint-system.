import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function RoleHeader({ roleLabel }) {
  const navigate = useNavigate()
  const { resetUser } = useUser()

  function switchRole() {
    resetUser()
    navigate('/')
  }

  return (
    <div className="role-header">
      <span className="role-badge">{roleLabel} view</span>
      <button className="link-btn" onClick={switchRole}>Switch role</button>
    </div>
  )
}
