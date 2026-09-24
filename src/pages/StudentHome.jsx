import React, { useEffect, useState } from 'react'
import RoleHeader from '../components/RoleHeader.jsx'
import { useUser } from '../context/UserContext.jsx'
import { api, uploadUrl } from '../lib/api.js'

const statusText = { pending: 'Waiting for review', assigned: 'Assigned to staff', 'in progress': 'Being fixed', resolved: 'Resolved', rejected: 'Not approved' }

export default function StudentHome() {
  const { user } = useUser()
  const [complaints, setComplaints] = useState([])
  const [form, setForm] = useState({ category: 'Plumbing', description: '' })
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  useEffect(() => { api.complaints().then(setComplaints).catch((err) => setError(err.message)) }, [])

  async function submit(event) {
    event.preventDefault(); setError('')
    if (form.description.trim().length < 10) return setError('Please add a little more detail so the team can help quickly.')
    const body = new FormData(); body.append('category', form.category); body.append('description', form.description.trim()); if (photo) body.append('photo', photo)
    try { const created = await api.createComplaint(body); setComplaints((items) => [created, ...items]); setForm({ category: 'Plumbing', description: '' }); setPhoto(null); event.target.reset(); setSent(true); setTimeout(() => setSent(false), 3500) } catch (err) { setError(err.message) }
  }

  return <div className="dashboard"><RoleHeader roleLabel="Student" /><main className="content">
    <div className="welcome-row"><div><p className="eyebrow">YOUR RESIDENCE</p><h1>Good to see you, {user.rollNo}</h1><p className="subtitle">Room {user.roomNo} · We’ll keep you posted here.</p></div><div className="round-avatar">{user.rollNo.slice(0, 1)}</div></div>
    <div className="student-grid"><section className="surface form-surface"><div className="section-title"><span className="section-icon">＋</span><div><h2>Report an issue</h2><p>Tell us what needs attention.</p></div></div>
      <form onSubmit={submit}><label>What’s the issue about?<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Cleaning</option><option>Internet</option><option>Other</option></select></label>
      <label>Describe the problem<textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened? Where exactly? Anything else we should know?" /></label>
      <label className="upload-box"><span>⌁</span><span><strong>{photo ? photo.name : 'Add a photo'}</strong><small>Optional · PNG or JPG up to 5MB</small></span><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} /></label>
      {error && <p className="error-text">{error}</p>}{sent && <p className="success-text">Your request is on its way to the residence team.</p>}<button className="primary-btn">Send request <span>→</span></button></form>
    </section><section className="surface"><div className="section-title"><span className="section-icon">◷</span><div><h2>Your requests</h2><p>{complaints.length ? `${complaints.length} request${complaints.length === 1 ? '' : 's'} in your history` : 'Nothing here yet'}</p></div></div>
      <div className="request-list">{complaints.map((item) => <article className="request-item" key={item.id}><div className={`status-dot ${item.status}`} /><div className="request-main"><div className="request-top"><strong>{item.category}</strong><span className={`status-pill ${item.status}`}>{statusText[item.status] || item.status}</span></div><p>{item.description}</p><small>{new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{item.assigned_to ? ` · ${item.assigned_to}` : ''}</small>{item.photo_url && <img className="request-photo" src={uploadUrl(item.photo_url)} alt="" />}</div></article>)}</div>
    </section></div>
  </main></div>
}
