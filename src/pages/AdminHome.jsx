import React, { useState } from 'react'
import RoleHeader from '../components/RoleHeader.jsx'
import sampleComplaints from '../data/sampleComplaints.js'

export default function AdminHome() {
  const [complaints] = useState(sampleComplaints)

  // "Open" = not yet confirmed/rejected — still moving through the pipeline
  const openStatuses = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN PROGRESS']
  const openIssues = complaints.filter((c) => openStatuses.includes(c.status)).length

  // For a real system, "overdue" would compare against the SLA deadline.
  // With fake data we don't have timestamps yet, so this stays at 0 for now
  // — Member 2's backend will supply real dates to calculate this properly.
  const overdueIssues = 0

  const resolvedToday = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CONFIRMED').length

  // Same placeholder note as overdue — real average needs timestamps from the backend.
  const avgResolutionTime = '—'

  return (
    <div className="page">
      <RoleHeader roleLabel="Admin" />
      <h2>Admin Dashboard</h2>
      <p className="subtitle">Maintenance performance overview</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{openIssues}</span>
          <span className="stat-label">Open Issues</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{overdueIssues}</span>
          <span className="stat-label">Overdue Issues</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{avgResolutionTime}</span>
          <span className="stat-label">Avg Resolution Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{resolvedToday}</span>
          <span className="stat-label">Resolved Today</span>
        </div>
      </div>

      <div className="placeholder-card" style={{ marginTop: 20 }}>
        <p>Note: Overdue Issues and Avg Resolution Time will show real values once Member 2's backend provides timestamps for each complaint.</p>
      </div>
    </div>
  )
}