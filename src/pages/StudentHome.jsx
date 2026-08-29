import React, { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'
import RoleHeader from '../components/RoleHeader.jsx'
import sampleComplaints from '../data/sampleComplaints.js'

export default function StudentHome() {
  const { student } = useUser()

  // One useState per form field
  const [category, setCategory] = useState('Plumbing')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)

  // Start the list with the fake data, then add to it on submit
  const [complaints, setComplaints] = useState(sampleComplaints)

  function handlePhotoChange(e) {
    setPhoto(e.target.files[0]) // just store the file object for now
  }

  function handleSubmit(e) {
    e.preventDefault() // stops the page from refreshing
    if (!description.trim()) return

    const newComplaint = {
      id: Date.now(), // quick unique id for now
      category,
      description,
      status: 'REPORTED',
      roomNo: student.roomNo,
    }

    setComplaints([newComplaint, ...complaints])

    // reset the form
    setDescription('')
    setCategory('Plumbing')
    setPhoto(null)
  }

  return (
    <div className="page">
      <RoleHeader roleLabel="Student" />
      <h2>Welcome, {student.rollNo}</h2>
      <p className="subtitle">Room {student.roomNo}</p>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Ceiling</option>
            <option>Furniture</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
          />
        </label>

        <label>
          Photo
          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
        </label>

        <button type="submit" className="primary-btn">Submit Complaint</button>
      </form>

      <h3>My Complaints</h3>
      <div className="complaint-list">
        {complaints.map((c) => (
          <div key={c.id} className="complaint-card">
            <strong>{c.category}</strong>
            <p>{c.description}</p>
            <span className="status-badge">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}