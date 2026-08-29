import React, { createContext, useContext, useState } from 'react'

// Holds "who the app thinks the current user is" since there's no login.
// role: 'student' | 'staff' | 'admin' | null
// student: { rollNo, roomNo } — only filled in when role === 'student'
const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [role, setRole] = useState(null)
  const [student, setStudent] = useState({ rollNo: '', roomNo: '' })

  function resetUser() {
    setRole(null)
    setStudent({ rollNo: '', roomNo: '' })
  }

  const value = { role, setRole, student, setStudent, resetUser }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Custom hook so pages just call useUser() instead of importing useContext everywhere
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside a <UserProvider>')
  return ctx
}
