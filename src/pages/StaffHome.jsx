import React, { useState } from 'react'
import RoleHeader from '../components/RoleHeader.jsx'
import sampleComplaints from '../data/sampleComplaints.js'

export default function StaffHome() {
  const [complaints, setComplaints] = useState(sampleComplaints)
  // Tracks what the staff member is currently typing into the "expected completion" box, per complaint id
  const [expectedInputs, setExpectedInputs] = useState({})

  function updateStatus(id, newStatus, extra = {}) {
    setComplaints(
      complaints.map((c) =>
        c.id === id
          ? { ...c, status: newStatus, previousStatus: c.status, ...extra }
          : c
      )
    )
  }

  function undo(id) {
    setComplaints(
      complaints.map((c) =>
        c.id === id && c.previousStatus
          ? { ...c, status: c.previousStatus, previousStatus: null }
          : c
      )
    )
  }

  function verify(id) { updateStatus(id, 'VERIFIED') }
  function reject(id) { updateStatus(id, 'REJECTED') }

  function assign(id) {
    const expected = expectedInputs[id]
    if (!expected) return // require a time to be chosen before assigning
    updateStatus(id, 'ASSIGNED', { expectedCompletion: expected })
  }

  function startProgress(id) { updateStatus(id, 'IN PROGRESS') }
  function markResolved(id) { updateStatus(id, 'RESOLVED') }

  function setExpectedInput(id, value) {
    setExpectedInputs({ ...expectedInputs, [id]: value })
  }

  return (
    <div className="page">
      <RoleHeader roleLabel="Staff" />
      <h2>Staff Dashboard</h2>
      <p className="subtitle">{complaints.length} complaints total</p>

      <div className="complaint-list">
        {complaints.map((c) => (
          <div key={c.id} className="complaint-card">
            <strong>{c.category}</strong>
            <p>{c.description}</p>
            <p className="subtitle" style={{ margin: '4px 0' }}>Room {c.roomNo}</p>
            <span className="status-badge">{c.status}</span>

            {c.expectedCompletion && (
              <p className="subtitle" style={{ margin: '4px 0' }}>
                Expected by: {c.expectedCompletion}
              </p>
            )}

            <div className="action-row">
              {c.status === 'REPORTED' && (
                <>
                  <button className="small-btn" onClick={() => verify(c.id)}>Verify</button>
                  <button className="small-btn danger" onClick={() => reject(c.id)}>Reject</button>
                </>
              )}

              {c.status === 'VERIFIED' && (
                <>
                  <input
                    type="datetime-local"
                    className="datetime-input"
                    value={expectedInputs[c.id] || ''}
                    onChange={(e) => setExpectedInput(c.id, e.target.value)}
                  />
                  <button className="small-btn" onClick={() => assign(c.id)}>Assign</button>
                </>
              )}

              {c.status === 'ASSIGNED' && (
                <button className="small-btn" onClick={() => startProgress(c.id)}>Start Progress</button>
              )}
              {c.status === 'IN PROGRESS' && (
                <button className="small-btn" onClick={() => markResolved(c.id)}>Mark Resolved</button>
              )}

              {c.previousStatus && (
                <button className="small-btn undo" onClick={() => undo(c.id)}>Undo</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}