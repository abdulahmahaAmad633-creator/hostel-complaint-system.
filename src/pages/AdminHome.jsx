import React, { useEffect, useState } from "react";
import RoleHeader from "../components/RoleHeader.jsx";
import { api } from "../lib/api.js";

export default function AdminHome() {
  const [analytics, setAnalytics] = useState(null);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff",
  });
  const [message, setMessage] = useState("");
  function load() {
    Promise.all([api.analytics(), api.staff()])
      .then(([stats, team]) => {
        setAnalytics(stats);
        setStaff(team);
      })
      .catch((err) => setMessage(err.message));
  }
  useEffect(load, []);
  async function add(event) {
    event.preventDefault();
    try {
      await api.addStaff(form);
      setForm({ name: "", username: "", password: "", role: "staff" });
      setMessage("Team member added.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }
  async function remove(id) {
    if (!window.confirm("Remove this team member?")) return;
    try {
      await api.removeStaff(id);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }
  const total = analytics?.total || 0;
  const open =
    total -
    (analytics?.byStatus?.resolved || 0) -
    (analytics?.byStatus?.rejected || 0);
  return (
    <div className="dashboard">
      <RoleHeader roleLabel="Administrator" />
      <main className="content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">OPERATIONS OVERVIEW</p>
            <h1>See the whole picture.</h1>
            <p className="subtitle">
              A pulse check on residence support and your team.
            </p>
          </div>
          <div className="round-avatar admin-avatar">◈</div>
        </div>
        <div className="admin-stats">
          <div>
            <span>Total requests</span>
            <strong>{total}</strong>
            <small>All time</small>
          </div>
          <div>
            <span>Open right now</span>
            <strong>{open}</strong>
            <small>Need attention</small>
          </div>
          <div>
            <span>Resolved</span>
            <strong>{analytics?.byStatus?.resolved || 0}</strong>
            <small>Successfully closed</small>
          </div>
          <div>
            <span>Top category</span>
            <strong className="category-stat">
              {Object.entries(analytics?.byCategory || {}).sort(
                (a, b) => b[1] - a[1],
              )[0]?.[0] || "—"}
            </strong>
            <small>Most reported</small>
          </div>
        </div>
        <div className="admin-grid">
          <section className="surface">
            <div className="toolbar">
              <div>
                <h2>Team access</h2>
                <p className="subtitle">{staff.length} people with access</p>
              </div>
            </div>
            <div className="team-list">
              {staff.map((person) => (
                <div className="team-row" key={person.id}>
                  <span className="round-avatar">
                    {person.name.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{person.name}</strong>
                    <small>
                      {person.username} · {person.role}
                    </small>
                  </div>
                  {person.role !== "admin" && (
                    <button
                      className="icon-btn"
                      onClick={() => remove(person.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="surface">
            <div className="section-title">
              <span className="section-icon">＋</span>
              <div>
                <h2>Add a teammate</h2>
                <p>Create access for hostel staff or an administrator.</p>
              </div>
            </div>
            <form className="compact-form" onSubmit={add}>
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="staff">Hostel staff</option>
                <option value="admin">Administrator</option>
              </select>
              <button className="primary-btn">Add to team</button>
              {message && <p className="success-text">{message}</p>}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
