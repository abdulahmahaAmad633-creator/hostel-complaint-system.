const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("hostel_token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "The backend is not running. Start it on port 3001 and try again.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("hostel_token");
      localStorage.removeItem("hostel_user");
    }
    throw new Error(payload.error || "Something went wrong");
  }
  return payload;
}

export const api = {
  login: (body) =>
    request("/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) =>
    request("/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/logout", { method: "POST" }),
  me: () => request("/me"),
  complaints: () => request("/complaints"),
  createComplaint: (body) => request("/complaints", { method: "POST", body }),
  updateComplaint: (id, body) =>
    request(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  staff: () => request("/staff"),
  addStaff: (body) =>
    request("/staff", { method: "POST", body: JSON.stringify(body) }),
  removeStaff: (id) => request(`/staff/${id}`, { method: "DELETE" }),
  analytics: () => request("/analytics"),
};

export function uploadUrl(path) {
  return path ? `${API_URL.replace("/api", "")}${path}` : "";
}
