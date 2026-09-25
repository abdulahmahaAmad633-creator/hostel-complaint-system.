import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

export default function RoleHeader({ roleLabel }) {
  const navigate = useNavigate();
  const { resetUser, user } = useUser();

  async function signOut() {
    await resetUser();
    navigate("/", { replace: true });
  }

  return (
    <header className="role-header">
      <div className="brand">
        <span className="brand-mark">K</span>
        <span>KIIT University</span>
      </div>
      <div className="header-actions">
        <span className="role-badge">{roleLabel}</span>
        <span className="user-name">{user?.name || user?.rollNo}</span>
        <button className="link-btn" onClick={signOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
