import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hostel_user')) || null } catch { return null }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('hostel_token')))

  useEffect(() => {
    if (!localStorage.getItem('hostel_token')) { setLoading(false); return }
    api.me().then(({ user: currentUser }) => setUser(currentUser)).catch(() => {
      localStorage.removeItem('hostel_token')
      localStorage.removeItem('hostel_user')
      setUser(null)
    }).finally(() => setLoading(false))
  }, [])

  function setSession(token, currentUser) {
    localStorage.setItem('hostel_token', token)
    localStorage.setItem('hostel_user', JSON.stringify(currentUser))
    setUser(currentUser)
  }

  async function resetUser() {
    try { await api.logout() } catch {}
    localStorage.removeItem('hostel_token')
    localStorage.removeItem('hostel_user')
    setUser(null)
  }

  const value = { user, role: user?.role || null, loading, setSession, resetUser }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside UserProvider')
  return ctx
}
