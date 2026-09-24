import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { api } from '../lib/api.js'

export default function StudentIdentify() {
  const navigate = useNavigate()
  const { setSession } = useUser()
  const [form, setForm] = useState({ rollNo: '', roomNo: '' })
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!form.rollNo.trim() || !form.roomNo.trim()) return setError('Enter both your roll number and room number.')
    try {
      const result = await api.login({ ...form, role: 'student' })
      setSession(result.token, result.user)
      navigate('/student')
    } catch (err) { setError(err.message) }
  }
  return <main className="auth-page"><div className="auth-card">
    <div className="brand"><span className="brand-mark">H</span><span>HavenDesk</span></div>
    <p className="eyebrow">STUDENT ACCESS</p><h1>Let’s get you to your room.</h1><p className="subtitle">Use your campus details to see requests linked to you.</p>
    <form className="signin-form" onSubmit={submit}>
      <label>Roll number<input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="e.g. CS21B045" maxLength={20} required /></label>
      <label>Room number<input value={form.roomNo} onChange={(e) => setForm({ ...form, roomNo: e.target.value })} placeholder="e.g. B-204" maxLength={20} required /></label>
      {error && <p className="error-text">{error}</p>}<button className="primary-btn">Open my dashboard <span>→</span></button>
    </form><button className="back-btn" onClick={() => navigate('/')}>← Choose another role</button>
  </div></main>
}
