const express = require("express");
const router = express.Router();
const db = require("../database/db");

// GET all students (supports ?branch=&status=&search=)
router.get("/", (req, res) => {
  const { branch, status, search } = req.query;
  let query = "SELECT * FROM students WHERE 1=1";
  const params = [];

  if (branch) {
    query += " AND branch = ?";
    params.push(branch);
  }
  if (status) {
    query += " AND placement_status = ?";
    params.push(status);
  }
  if (search) {
    query += " AND (name LIKE ? OR roll_number LIKE ? OR skills LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += " ORDER BY id DESC";

  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET single student with their applications
router.get("/:id", (req, res) => {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const applications = db
    .prepare(
      `SELECT a.*, c.name AS company_name, c.job_role
       FROM applications a JOIN companies c ON c.id = a.company_id
       WHERE a.student_id = ? ORDER BY a.application_date DESC`
    )
    .all(req.params.id);

  res.json({ ...student, applications });
});

// POST create student
router.post("/", (req, res) => {
  const { name, roll_number, branch, cgpa, skills, email, phone, placement_status } = req.body;
  if (!name || !roll_number || !branch || cgpa === undefined || !email) {
    return res.status(400).json({ error: "name, roll_number, branch, cgpa and email are required" });
  }
  try {
    const stmt = db.prepare(`
      INSERT INTO students (name, roll_number, branch, cgpa, skills, email, phone, placement_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'Not Placed'))
    `);
    const info = stmt.run(name, roll_number, branch, cgpa, skills || "", email, phone || "", placement_status);
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update student
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Student not found" });

  const merged = { ...existing, ...req.body };
  try {
    db.prepare(`
      UPDATE students SET name=?, roll_number=?, branch=?, cgpa=?, skills=?, email=?, phone=?, placement_status=?
      WHERE id=?
    `).run(
      merged.name, merged.roll_number, merged.branch, merged.cgpa,
      merged.skills, merged.email, merged.phone, merged.placement_status,
      req.params.id
    );
    res.json(db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE student
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Student not found" });
  res.json({ message: "Student deleted" });
});

module.exports = router;
