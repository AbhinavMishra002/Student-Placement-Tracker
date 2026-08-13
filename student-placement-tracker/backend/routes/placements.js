const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, a.student_id, a.company_id, s.name AS student_name, s.roll_number, c.name AS company_name
    FROM placements p
    JOIN applications a ON a.id = p.application_id
    JOIN students s ON s.id = a.student_id
    JOIN companies c ON c.id = a.company_id
    ORDER BY p.joining_date DESC
  `).all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { application_id, offer_status, selected_company, final_package, joining_date, placement_confirmed } = req.body;
  if (!application_id || !selected_company || final_package === undefined) {
    return res.status(400).json({ error: "application_id, selected_company and final_package are required" });
  }

  const application = db.prepare("SELECT * FROM applications WHERE id = ?").get(application_id);
  if (!application) return res.status(404).json({ error: "Application not found" });

  try {
    const info = db.prepare(`
      INSERT INTO placements (application_id, offer_status, selected_company, final_package, joining_date, placement_confirmed)
      VALUES (?, COALESCE(?, 'Offer Extended'), ?, ?, ?, COALESCE(?, 0))
    `).run(application_id, offer_status, selected_company, final_package, joining_date || null, placement_confirmed);

    // Automation: creating a confirmed Placement record marks the application
    // as Offered and the student's overall status as Placed — the same way a
    // Salesforce Flow would cascade updates across related objects.
    db.prepare("UPDATE applications SET status = 'Offered' WHERE id = ?").run(application_id);
    if (placement_confirmed) {
      db.prepare("UPDATE students SET placement_status = 'Placed' WHERE id = ?").run(application.student_id);
    }

    res.status(201).json(db.prepare("SELECT * FROM placements WHERE id = ?").get(info.lastInsertRowid));
  } catch (err) {
    res.status(400).json({ error: "A placement record already exists for this application." });
  }
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM placements WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Placement not found" });
  const merged = { ...existing, ...req.body };

  db.prepare(`
    UPDATE placements SET offer_status=?, selected_company=?, final_package=?, joining_date=?, placement_confirmed=?
    WHERE id=?
  `).run(merged.offer_status, merged.selected_company, merged.final_package, merged.joining_date, merged.placement_confirmed, req.params.id);

  const application = db.prepare("SELECT * FROM applications WHERE id = ?").get(merged.application_id);
  if (merged.placement_confirmed && application) {
    db.prepare("UPDATE students SET placement_status = 'Placed' WHERE id = ?").run(application.student_id);
  }

  res.json(db.prepare("SELECT * FROM placements WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM placements WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Placement not found" });
  res.json({ message: "Placement deleted" });
});

module.exports = router;
