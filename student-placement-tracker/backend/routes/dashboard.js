const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Aggregate reporting endpoint — the equivalent of a Salesforce Report/Dashboard,
// built here with plain SQL aggregate queries instead of SOQL.
router.get("/stats", (req, res) => {
  const totalStudents = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;
  const totalCompanies = db.prepare("SELECT COUNT(*) AS c FROM companies").get().c;
  const totalApplications = db.prepare("SELECT COUNT(*) AS c FROM applications").get().c;
  const totalPlacements = db.prepare("SELECT COUNT(*) AS c FROM placements WHERE placement_confirmed = 1").get().c;

  const placedStudents = db.prepare("SELECT COUNT(*) AS c FROM students WHERE placement_status = 'Placed'").get().c;
  const placementRate = totalStudents ? Math.round((placedStudents / totalStudents) * 1000) / 10 : 0;

  const avgPackage = db.prepare("SELECT AVG(final_package) AS a FROM placements").get().a || 0;
  const highestPackage = db.prepare("SELECT MAX(final_package) AS m FROM placements").get().m || 0;

  // Funnel: how many applications currently sit at each pipeline stage
  const funnel = db.prepare(`
    SELECT status, COUNT(*) AS count FROM applications GROUP BY status
  `).all();

  const statusOrder = ["Applied", "Shortlisted", "Interviewing", "Offered", "Rejected", "Withdrawn"];
  const funnelOrdered = statusOrder.map((status) => ({
    status,
    count: funnel.find((f) => f.status === status)?.count || 0,
  }));

  // Branch-wise distribution
  const branchDistribution = db.prepare(`
    SELECT branch, COUNT(*) AS total,
           SUM(CASE WHEN placement_status = 'Placed' THEN 1 ELSE 0 END) AS placed
    FROM students GROUP BY branch
  `).all();

  // Placement-status breakdown for a pie/donut chart
  const statusBreakdown = db.prepare(`
    SELECT placement_status AS status, COUNT(*) AS count FROM students GROUP BY placement_status
  `).all();

  // Top recruiting companies by number of offers made
  const topCompanies = db.prepare(`
    SELECT c.name, COUNT(p.id) AS offers
    FROM placements p
    JOIN applications a ON a.id = p.application_id
    JOIN companies c ON c.id = a.company_id
    GROUP BY c.name ORDER BY offers DESC LIMIT 5
  `).all();

  res.json({
    totalStudents,
    totalCompanies,
    totalApplications,
    totalPlacements,
    placedStudents,
    placementRate,
    avgPackage: Math.round(avgPackage * 100) / 100,
    highestPackage,
    funnel: funnelOrdered,
    branchDistribution,
    statusBreakdown,
    topCompanies,
  });
});

module.exports = router;
