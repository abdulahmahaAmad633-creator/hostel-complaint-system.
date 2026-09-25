import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { api } from "../lib/api.js";

const roles = [
  {
    id: "student",
    icon: "⌂",
    title: "Student",
    text: "Report hostel issues and track updates.",
  },
  {
    id: "staff",
    icon: "✦",
    title: "Hostel staff",
    text: "Review requests and assign maintenance work.",
  },
  {
    id: "admin",
    icon: "◈",
    title: "Administrator",
    text: "Monitor service quality and team access.",
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setSession } = useUser();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (selected === "student") return navigate("/student/identify");
    setBusy(true);
    setError("");
    try {
      const result = await api.login({ ...form, role: selected });
      setSession(result.token, result.user);
      navigate(`/${selected}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(event) {
    event.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (
      !registerForm.name.trim() ||
      !registerForm.username.trim() ||
      !registerForm.password.trim()
    ) {
      setRegisterError("Please fill in name, username and password.");
      return;
    }

    try {
      await api.register(registerForm);
      setRegisterSuccess(
        "Account created successfully. You can now sign in with your username and password.",
      );
      setRegisterForm({ name: "", username: "", password: "", role: "staff" });
    } catch (err) {
      setRegisterError(err.message);
    }
  }

  return (
    <main className="landing">
      <div className="landing-copy">
        <div className="brand brand-large">
          <span className="brand-mark">K</span>
          <span>KIIT University</span>
        </div>
        <p className="eyebrow">HOSTEL SERVICES PORTAL</p>
        <h1>
          Campus support for a <em>smoother</em> stay.
        </h1>
        <p className="lead">
          Report maintenance issues, follow up on requests, and keep hostel life
          moving without the usual confusion.
        </p>
        <div className="trust-row">
          <span>● 24/7 support</span>
          <span>● Maintenance tracking</span>
          <span>● KIIT residence team</span>
        </div>
      </div>
      <section className="role-panel">
        <div className="panel-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Choose your access point</h2>
        </div>
        <div className="role-list">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`role-option ${selected === role.id ? "active" : ""}`}
              onClick={() => {
                setSelected(role.id);
                setError("");
              }}
            >
              <span className="role-icon">{role.icon}</span>
              <span>
                <strong>{role.title}</strong>
                <small>{role.text}</small>
              </span>
              <span className="arrow">→</span>
            </button>
          ))}
        </div>
        {selected && selected !== "student" && (
          <form className="signin-form" onSubmit={submit}>
            <input
              aria-label="Username"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              aria-label="Password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button className="primary-btn" disabled={busy}>
              {busy ? "Signing in…" : `Continue as ${selected}`}
            </button>
          </form>
        )}
        {selected === "student" && (
          <button className="primary-btn full-btn" onClick={submit}>
            Continue as student <span>→</span>
          </button>
        )}

        <form
          className="signin-form"
          onSubmit={createAccount}
          style={{ marginTop: 22 }}
        >
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            CREATE ACCOUNT
          </p>
          <input
            aria-label="Full name"
            placeholder="Full name"
            value={registerForm.name}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, name: e.target.value })
            }
          />
          <input
            aria-label="New username"
            placeholder="Username"
            value={registerForm.username}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, username: e.target.value })
            }
          />
          <input
            aria-label="New password"
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
          />
          <select
            value={registerForm.role}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, role: e.target.value })
            }
          >
            <option value="staff">Hostel staff</option>
            <option value="admin">Administrator</option>
          </select>
          {registerError && <p className="error-text">{registerError}</p>}
          {registerSuccess && <p className="success-text">{registerSuccess}</p>}
          <button type="submit" className="primary-btn">
            Create account <span>→</span>
          </button>
        </form>

        <p className="panel-foot">
          Your information stays within the KIIT hostel support team.
        </p>
      </section>
    </main>
  );
}
