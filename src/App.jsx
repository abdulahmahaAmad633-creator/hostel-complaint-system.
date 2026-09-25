import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext.jsx'
import RequireRole from './components/RequireRole.jsx'

import RoleSelect from './pages/RoleSelect.jsx'
import StudentIdentify from './pages/StudentIdentify.jsx'
import StudentHome from './pages/StudentHome.jsx'
import StaffHome from './pages/StaffHome.jsx'
import AdminHome from './pages/AdminHome.jsx'

export default function App() {
  return (
    <UserProvider>
      <div className="app-shell"><Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/student/identify" element={<StudentIdentify />} />

        <Route
          path="/student"
          element={
            <RequireRole role="student">
              <StudentHome />
            </RequireRole>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireRole role="staff">
              <StaffHome />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminHome />
            </RequireRole>
          }
        />
      </Routes></div>
    </UserProvider>
  )
}
