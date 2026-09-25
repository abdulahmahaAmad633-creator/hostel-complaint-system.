import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

const defaultData = {
  complaints: [],
  staff: [
    {
      id: "s1",
      name: "Ravi",
      role: "staff",
      username: "ravi",
      password: "staff123",
    },
    {
      id: "s2",
      name: "Priya",
      role: "staff",
      username: "priya",
      password: "staff123",
    },
    {
      id: "a1",
      name: "Admin",
      role: "admin",
      username: "admin",
      password: "admin123",
    },
  ],
};

export async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      const copy = JSON.parse(JSON.stringify(defaultData));
      await writeDB(copy);
      return copy;
    }
    throw err;
  }
}

export async function writeDB(data) {
  const tmp = DB_PATH + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

export async function seedIfNeeded() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await writeDB(defaultData);
  }
}

export async function registerUser({
  name,
  username,
  password,
  role = "staff",
}) {
  if (!name || !username || !password) {
    throw new Error("name, username, and password are required");
  }

  const normalizedRole = role === "admin" ? "admin" : "staff";
  const cleanName = String(name).trim();
  const cleanUsername = String(username).trim();
  const cleanPassword = String(password);

  if (!cleanName || !cleanUsername || !cleanPassword) {
    throw new Error("name, username, and password are required");
  }

  const db = await readDB();
  if (db.staff.some((user) => user.username === cleanUsername)) {
    throw new Error("Username already exists");
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: cleanName,
    username: cleanUsername,
    password: cleanPassword,
    role: normalizedRole,
  };

  db.staff.push(newUser);
  await writeDB(db);

  return { ...newUser };
}
