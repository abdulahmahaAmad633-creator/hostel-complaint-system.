import test from "node:test";
import assert from "node:assert/strict";
import { readDB, registerUser } from "../backend/db.js";

test("registerUser persists a new staff account so it can log in later", async () => {
  const username = `hostelstaff-${Date.now()}`;
  const created = await registerUser({
    name: "Test Hostel Staff",
    username,
    password: "securePass123",
    role: "staff",
  });

  const db = await readDB();
  const saved = db.staff.find((user) => user.username === username);

  assert.equal(created.username, username);
  assert.equal(saved?.role, "staff");
  assert.equal(saved?.password, "securePass123");
  assert.ok(saved);
});
