import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setRole } = useUser()

  function chooseRole(role) {
    setRole(role)
    if (role === 'student') {
      navigate('/student/identify')
    } else {
      navigate(`/${role}`)
    }
  }

  return (
    <div className="page centered">
      <h1>Hostel Complaint System</h1>
      <p className="subtitle">Choose how you're using the app</p>

      <div className="role-grid">
        <button className="role-card" onClick={() => chooseRole('student')}>
          <span className="role-icon">🎓</span>
          <span>Student</span>
        </button>
        <button className="role-card" onClick={() => chooseRole('staff')}>
          <span className="role-icon">🛠️</span>
          <span>Staff</span>
        </button>
        <button className="role-card" onClick={() => chooseRole('admin')}>
          <span className="role-icon">🗂️</span>
          <span>Admin</span>
        </button>
      </div>
    </div>
  )
}
