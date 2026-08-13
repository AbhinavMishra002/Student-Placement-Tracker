const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM companies WHERE 1=1";
  const params = [];
  if (search) {
    query += " AND (name LIKE ? OR job_role LIKE ? OR industry LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  query += " ORDER BY drive_date DESC";
  res.json(db.prepare(query).all(...params));
});

router.get("/:id", (req, res) => {
  const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
  if (!company) return res.status(404).json({ error: "Company not found" });

  const applications = db
    .prepare(
      `SELECT a.*, s.name AS student_name, s.roll_number
       FROM applications a JOIN students s ON s.id = a.student_id
       WHERE a.company_id = ? ORDER BY a.application_date DESC`
    )
    .all(req.params.id);

  res.json({ ...company, applications });
});

router.post("/", (req, res) => {
  const { name, industry, job_role, package_ctc, eligibility_criteria, required_skills, drive_date } = req.body;
  if (!name || !industry || !job_role || package_ctc === undefined) {
    return res.status(400).json({ error: "name, industry, job_role and package_ctc are required" });
  }
  const info = db.prepare(`
    INSERT INTO companies (name, industry, job_role, package_ctc, eligibility_criteria, required_skills, drive_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, industry, job_role, package_ctc, eligibility_criteria || "", required_skills || "", drive_date || null);
  res.status(201).json(db.prepare("SELECT * FROM companies WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Company not found" });
  const merged = { ...existing, ...req.body };
  db.prepare(`
    UPDATE companies SET name=?, industry=?, job_role=?, package_ctc=?, eligibility_criteria=?, required_skills=?, drive_date=?
    WHERE id=?
  `).run(merged.name, merged.industry, merged.job_role, merged.package_ctc, merged.eligibility_criteria, merged.required_skills, merged.drive_date, req.params.id);
  res.json(db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM companies WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Company not found" });
  res.json({ message: "Company deleted" });
});

module.exports = router;
