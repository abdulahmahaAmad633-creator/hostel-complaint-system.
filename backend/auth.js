import crypto from "crypto";

const sessions = new Map();

export function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { ...user });
  return token;
}

export function getSession(token) {
  return sessions.get(token);
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = token ? getSession(token) : null;

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = session;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
