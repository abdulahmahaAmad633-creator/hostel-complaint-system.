import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function StudentIdentify() {
  const navigate = useNavigate()
  const { setStudent } = useUser()
  const [rollNo, setRollNo] = useState('')
  const [roomNo, setRoomNo] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!rollNo.trim() || !roomNo.trim()) {
      setError('Please enter both your roll number and room number.')
      return
    }
    setStudent({ rollNo: rollNo.trim(), roomNo: roomNo.trim() })
    // Every complaint this student submits later gets tagged with these two values,
    // so "my complaints" can be filtered without needing a real login.
    navigate('/student')
  }

  return (
    <div className="page centered">
      <h1>Student Details</h1>
      <p className="subtitle">We use this to show you your own complaints — no password needed.</p>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Roll Number
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. CS21B045"
          maxLength={8}
          />
        </label>

        <label>
          Room Number
          <input
            type="text"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            placeholder="e.g. B-204"
          
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="primary-btn">Continue</button>
      </form>
    </div>
  )
}
