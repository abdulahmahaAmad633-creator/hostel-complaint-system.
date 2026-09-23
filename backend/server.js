import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

import { readDB, writeDB, seedIfNeeded } from "./db.js";
import {
  createSession,
  destroySession,
  requireAuth,
  requireRole,
} from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

await seedIfNeeded();

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { role, rollNo, roomNo, username, password } = req.body;

  if (role === "student") {
    if (!rollNo || !roomNo) {
      return res.status(400).json({ error: "rollNo and roomNo required" });
    }

    const user = {
      id: `student-${rollNo}`,
      name: `Student ${rollNo}`,
      role: "student",
      rollNo,
      roomNo,
    };

    const token = createSession(user);
    return res.json({ token, user });
  }

  const db = await readDB();
  const user = db.staff.find(
    (u) =>
      u.username === username && u.password === password && u.role === role,
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username/password/role" });
  }

  const { password: _pw, ...safeUser } = user;
  const token = createSession(safeUser);
  res.json({ token, user: safeUser });
});

// LOGOUT
app.post("/api/logout", requireAuth, (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) destroySession(token);
  res.json({ ok: true });
});

// ME
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// COMPLAINTS
app.get("/api/complaints", requireAuth, async (req, res) => {
  const db = await readDB();
  let list = db.complaints;

  if (req.user.role === "student") {
    list = list.filter((c) => c.roll_no === req.user.rollNo);
  } else if (req.user.role === "staff") {
    list = list.filter(
      (c) => c.status === "pending" || c.assigned_to === req.user.name,
    );
  }

  list = [...list].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  res.json(list);
});

app.post(
  "/api/complaints",
  requireAuth,
  requireRole("student"),
  upload.single("photo"),
  async (req, res) => {
    const { category, description } = req.body;

    if (!category || !description) {
      return res
        .status(400)
        .json({ error: "category and description required" });
    }

    const photo_url = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.photo_url || null;

    const db = await readDB();

    const complaint = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      roll_no: req.user.rollNo,
      room_no: req.user.roomNo,
      category,
      description,
      status: "pending",
      assigned_to: null,
      photo_url,
    };

    db.complaints.push(complaint);
    await writeDB(db);

    res.status(201).json(complaint);
  },
);

app.patch(
  "/api/complaints/:id",
  requireAuth,
  requireRole("staff", "admin"),
  async (req, res) => {
    const { status, assigned_to } = req.body;
    const db = await readDB();

    const complaint = db.complaints.find((c) => c.id === req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (req.user.role === "staff") {
      const canEdit =
        complaint.status === "pending" ||
        complaint.assigned_to === req.user.name;

      if (!canEdit) {
        return res.status(403).json({
          error: "You can only edit pending or assigned complaints",
        });
      }
    }

    if (status) complaint.status = status;

    if (assigned_to !== undefined) {
      complaint.assigned_to =
        assigned_to === "me" ? req.user.name : assigned_to;
    }

    await writeDB(db);
    res.json(complaint);
  },
);

// STAFF / ADMIN
app.get("/api/staff", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const staff = db.staff.map(({ password, ...s }) => s);
  res.json(staff);
});

app.post("/api/staff", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, username, password, role = "staff" } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ error: "name, username, password required" });
  }

  const db = await readDB();

  if (db.staff.some((s) => s.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const newStaff = {
    id: crypto.randomUUID(),
    name,
    username,
    password,
    role,
  };

  db.staff.push(newStaff);
  await writeDB(db);

  const { password: _pw, ...safe } = newStaff;
  res.status(201).json(safe);
});

app.delete(
  "/api/staff/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const db = await readDB();
    const before = db.staff.length;

    db.staff = db.staff.filter((s) => s.id !== req.params.id);

    if (db.staff.length === before) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await writeDB(db);
    res.json({ ok: true });
  },
);

// ANALYTICS
app.get(
  "/api/analytics",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const db = await readDB();

    const byStatus = db.complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const byCategory = db.complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total: db.complaints.length,
      byStatus,
      byCategory,
    });
  },
);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (max 5MB)" });
  }

  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
