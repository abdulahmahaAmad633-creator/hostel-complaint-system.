import fs from "fs/promises";
import path from "path";
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
