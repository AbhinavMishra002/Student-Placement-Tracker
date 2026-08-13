const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Automation helper — mirrors a Salesforce Flow / Apex Trigger:
// whenever an application's status changes, keep the related Student's
// placement_status in sync automatically instead of relying on manual edits.
function syncStudentStatus(studentId) {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  if (!student || student.placement_status === "Placed") return;

  const apps = db.prepare("SELECT status FROM applications WHERE student_id = ?").all(studentId);
  const hasOffer = apps.some((a) => a.status === "Offered");
  const hasActive = apps.some((a) => ["Applied", "Shortlisted", "Interviewing"].includes(a.status));

  let newStatus = "Not Placed";
  if (hasOffer) newStatus = "In Process";
  else if (hasActive) newStatus = "In Process";

  if (newStatus !== student.placement_status) {
    db.prepare("UPDATE students SET placement_status = ? WHERE id = ?").run(newStatus, studentId);
  }
}

router.get("/", (req, res) => {
  const { status, student_id, company_id } = req.query;
  let query = `
    SELECT a.*, s.name AS student_name, s.roll_number, c.name AS company_name, c.job_role
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN companies c ON c.id = a.company_id
    WHERE 1=1`;
  const params = [];
  if (status) { query += " AND a.status = ?"; params.push(status); }
  if (student_id) { query += " AND a.student_id = ?"; params.push(student_id); }
  if (company_id) { query += " AND a.company_id = ?"; params.push(company_id); }
  query += " ORDER BY a.application_date DESC";
  res.json(db.prepare(query).all(...params));
});

router.get("/:id", (req, res) => {
  const application = db.prepare(`
    SELECT a.*, s.name AS student_name, s.roll_number, c.name AS company_name, c.job_role
    FROM applications a
    JOIN students s ON s.id = a.student_id
    JOIN companies c ON c.id = a.company_id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found" });

  const interviews = db.prepare("SELECT * FROM interviews WHERE application_id = ? ORDER BY interview_date").all(req.params.id);
  const placement = db.prepare("SELECT * FROM placements WHERE application_id = ?").get(req.params.id);

  res.json({ ...application, interviews, placement: placement || null });
});

router.post("/", (req, res) => {
  const { student_id, company_id, application_date, status, resume_submitted } = req.body;
  if (!student_id || !company_id) {
    return res.status(400).json({ error: "student_id and company_id are required" });
  }
  try {
    const info = db.prepare(`
      INSERT INTO applications (student_id, company_id, application_date, status, resume_submitted)
      VALUES (?, ?, COALESCE(?, date('now')), COALESCE(?, 'Applied'), COALESCE(?, 1))
    `).run(student_id, company_id, application_date, status, resume_submitted);

    syncStudentStatus(student_id);
    res.status(201).json(db.prepare("SELECT * FROM applications WHERE id = ?").get(info.lastInsertRowid));
  } catch (err) {
    res.status(400).json({ error: "This student has already applied to this company." });
  }
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM applications WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Application not found" });
  const merged = { ...existing, ...req.body };

  db.prepare(`
    UPDATE applications SET student_id=?, company_id=?, application_date=?, status=?, resume_submitted=?
    WHERE id=?
  `).run(merged.student_id, merged.company_id, merged.application_date, merged.status, merged.resume_submitted, req.params.id);

  syncStudentStatus(merged.student_id);
  res.json(db.prepare("SELECT * FROM applications WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const app = db.prepare("SELECT * FROM applications WHERE id = ?").get(req.params.id);
  if (!app) return res.status(404).json({ error: "Application not found" });
  db.prepare("DELETE FROM applications WHERE id = ?").run(req.params.id);
  syncStudentStatus(app.student_id);
  res.json({ message: "Application deleted" });
});

module.exports = router;
