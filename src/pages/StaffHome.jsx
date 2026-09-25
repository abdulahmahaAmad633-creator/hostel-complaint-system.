import React, { useEffect, useState } from 'react'
import RoleHeader from '../components/RoleHeader.jsx'
import { api } from '../lib/api.js'

const nextAction = { pending: ['assigned', 'Assign to me'], assigned: ['in progress', 'Start work'], 'in progress': ['resolved', 'Mark resolved'] }

export default function StaffHome() {
  const [items, setItems] = useState([]); const [filter, setFilter] = useState('all'); const [error, setError] = useState('')
  function refresh() { api.complaints().then(setItems).catch((err) => setError(err.message)) }
  useEffect(refresh, [])
  async function update(id, status) { try { const changed = await api.updateComplaint(id, { status, assigned_to: status === 'assigned' ? 'me' : undefined }); setItems((list) => list.map((item) => item.id === id ? changed : item)) } catch (err) { setError(err.message) } }
  const visible = filter === 'all' ? items : items.filter((item) => item.status === filter)
  return <div className="dashboard"><RoleHeader roleLabel="Maintenance staff" /><main className="content"><div className="welcome-row"><div><p className="eyebrow">SERVICE DESK</p><h1>Keep the residence running.</h1><p className="subtitle">Review open requests, claim work and close the loop.</p></div><div className="metric-highlight"><strong>{items.filter((i) => i.status !== 'resolved' && i.status !== 'rejected').length}</strong><span>open requests</span></div></div>
    <section className="surface"><div className="toolbar"><div><h2>Request queue</h2><p className="subtitle">{items.length} requests visible to you</p></div><div className="filter-tabs">{['all', 'pending', 'assigned', 'in progress', 'resolved'].map((value) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div></div>{error && <p className="error-text">{error}</p>}<div className="staff-list">{visible.map((item) => <article className="staff-item" key={item.id}><div className="staff-item-head"><div><span className="category-label">{item.category}</span><h3>{item.description}</h3></div><span className={`status-pill ${item.status}`}>{item.status}</span></div><div className="meta-line">Room {item.room_no} · {new Date(item.created_at).toLocaleDateString()} {item.assigned_to && `· Assigned to ${item.assigned_to}`}</div>{nextAction[item.status] && <button className="small-btn" onClick={() => update(item.id, nextAction[item.status][0])}>{nextAction[item.status][1]} →</button>}</article>)}</div></section>
  </main></div>
}
