import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { api } from '../lib/api.js'

const roles = [
  { id: 'student', icon: '⌂', title: 'Student', text: 'Report an issue and track its progress.' },
  { id: 'staff', icon: '✦', title: 'Maintenance staff', text: 'Review, assign and resolve requests.' },
  { id: 'admin', icon: '◈', title: 'Administrator', text: 'Monitor service quality and team access.' },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const { setSession } = useUser()
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (selected === 'student') return navigate('/student/identify')
    setBusy(true); setError('')
    try {
      const result = await api.login({ ...form, role: selected })
      setSession(result.token, result.user)
      navigate(`/${selected}`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <main className="landing">
      <div className="landing-copy">
        <div className="brand brand-large"><span className="brand-mark">H</span><span>HavenDesk</span></div>
        <p className="eyebrow">RESIDENCE SUPPORT, SIMPLIFIED</p>
        <h1>A better stay starts with a <em>heard</em> voice.</h1>
        <p className="lead">A calm, transparent way to report hostel issues and keep every fix moving.</p>
        <div className="trust-row"><span>● 24/7 request tracking</span><span>● Clear ownership</span></div>
      </div>
      <section className="role-panel">
        <div className="panel-heading"><p className="eyebrow">WELCOME BACK</p><h2>Choose your workspace</h2></div>
        <div className="role-list">
          {roles.map((role) => <button key={role.id} className={`role-option ${selected === role.id ? 'active' : ''}`} onClick={() => { setSelected(role.id); setError('') }}>
            <span className="role-icon">{role.icon}</span><span><strong>{role.title}</strong><small>{role.text}</small></span><span className="arrow">→</span>
          </button>)}
        </div>
        {selected && selected !== 'student' && <form className="signin-form" onSubmit={submit}>
          <input aria-label="Username" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input aria-label="Password" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="error-text">{error}</p>}
          <button className="primary-btn" disabled={busy}>{busy ? 'Signing in…' : `Continue as ${selected}`}</button>
        </form>}
        {selected === 'student' && <button className="primary-btn full-btn" onClick={submit}>Continue as student <span>→</span></button>}
        <p className="panel-foot">Your information stays within the residence support team.</p>
      </section>
    </main>
  )
}
