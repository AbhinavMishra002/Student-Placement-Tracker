const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  const { application_id, result } = req.query;
  let query = `
    SELECT i.*, a.student_id, a.company_id, s.name AS student_name, c.name AS company_name
    FROM interviews i
    JOIN applications a ON a.id = i.application_id
    JOIN students s ON s.id = a.student_id
    JOIN companies c ON c.id = a.company_id
    WHERE 1=1`;
  const params = [];
  if (application_id) { query += " AND i.application_id = ?"; params.push(application_id); }
  if (result) { query += " AND i.result = ?"; params.push(result); }
  query += " ORDER BY i.interview_date DESC";
  res.json(db.prepare(query).all(...params));
});

router.post("/", (req, res) => {
  const { application_id, round, interview_date, result, feedback, interviewer } = req.body;
  if (!application_id || !round || !interview_date) {
    return res.status(400).json({ error: "application_id, round and interview_date are required" });
  }
  const info = db.prepare(`
    INSERT INTO interviews (application_id, round, interview_date, result, feedback, interviewer)
    VALUES (?, ?, ?, COALESCE(?, 'Pending'), ?, ?)
  `).run(application_id, round, interview_date, result, feedback || "", interviewer || "");

  // Automation: if this round is marked a Pass, move the application to "Interviewing"
  // (or leave later rounds to progress it further); if Fail, auto-reject the application.
  if (result === "Fail") {
    db.prepare("UPDATE applications SET status = 'Rejected' WHERE id = ?").run(application_id);
  } else if (result === "Pass") {
    db.prepare("UPDATE applications SET status = 'Interviewing' WHERE id = ? AND status NOT IN ('Offered','Rejected')").run(application_id);
  }

  res.status(201).json(db.prepare("SELECT * FROM interviews WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM interviews WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Interview not found" });
  const merged = { ...existing, ...req.body };

  db.prepare(`
    UPDATE interviews SET round=?, interview_date=?, result=?, feedback=?, interviewer=?
    WHERE id=?
  `).run(merged.round, merged.interview_date, merged.result, merged.feedback, merged.interviewer, req.params.id);

  if (merged.result === "Fail") {
    db.prepare("UPDATE applications SET status = 'Rejected' WHERE id = ?").run(merged.application_id);
  } else if (merged.result === "Pass") {
    db.prepare("UPDATE applications SET status = 'Interviewing' WHERE id = ? AND status NOT IN ('Offered','Rejected')").run(merged.application_id);
  }

  res.json(db.prepare("SELECT * FROM interviews WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM interviews WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Interview not found" });
  res.json({ message: "Interview deleted" });
});

module.exports = router;
