# From Salesforce to a Standalone Full-Stack App

This project reimplements the **Student Placement Tracker** — originally designed
as a Salesforce Admin/Dev internship project — as an independent, self-hosted
web application. The domain model, relationships, and automation logic are the
same; only the underlying platform is different. This doc maps each Salesforce
concept from the original project brief to its equivalent here, which is useful
if you need to explain your design choices in an internship report or viva.

| Salesforce Concept | Where it lives in this project |
|---|---|
| Custom Object (Student, Company, Application, Interview, Placement) | SQLite tables defined in `backend/database/db.js` |
| Custom Fields | Table columns (e.g. `cgpa`, `package_ctc`, `interview_result`) |
| Lookup / Master-Detail Relationship | SQL foreign keys with `ON DELETE CASCADE` (Student → Application → Interview/Placement) |
| Validation Rules | SQL `CHECK` constraints (e.g. CGPA between 0–10, enumerated status values) + input validation in Express routes |
| Record Types / Picklists | Fixed enumerations for `status`, `placement_status`, `result`, `offer_status` |
| Page Layouts | React form components in `frontend/src/pages/*.jsx` |
| Profiles & Permission Sets, Sharing & Security | Not implemented in this version — see "Suggested Extensions" below for how to add authentication and roles |
| Flows / Process Automation (Apex Triggers) | Business logic inside the Express route handlers — e.g. `syncStudentStatus()` in `routes/applications.js` automatically updates a Student's `placement_status` whenever an Application's status changes, and creating a confirmed Placement automatically marks the Student as "Placed" |
| Approval Processes | Modeled loosely via the `offer_status` field (`Offer Extended` → `Accepted`/`Declined`) |
| Reports & Dashboards | The `/api/dashboard/stats` endpoint (aggregate SQL queries) + the React `Dashboard.jsx` page with charts |
| SOQL / SOSL | Plain SQL queries via `better-sqlite3`, including filtered search (`GET /api/students?search=`) |
| Apex Classes / Apex Triggers | Route handler functions in `backend/routes/*.js` |
| Lightning Web Components (LWC) | React functional components (`frontend/src/components/*.jsx`) |
| Agentforce Integration | Out of scope for this version — could be replaced with an AI-assisted "suggest eligible companies for a student" feature calling an LLM API |

## Why this still demonstrates the same skills

Building this version required you to design the same relational data model,
write the same kind of business validation and automation rules, and build
the same reporting/dashboard experience — just expressed as REST APIs, SQL,
and a React UI instead of declarative Salesforce metadata. That's exactly the
kind of platform-to-platform translation a real engineer is asked to do.

## Suggested Extensions (if you want to go further for your submission)

- **Authentication & Roles** — add a `users` table and JWT-based login so only
  "Placement Officers" can create/edit records (mirrors Salesforce Profiles).
- **Approval workflow** — require a second officer to "approve" a Placement
  before `placement_confirmed` can be set to 1 (mirrors Approval Processes).
- **Audit trail** — log every status change to a `history` table (mirrors
  Salesforce Field History Tracking).
- **Export to CSV/PDF** — add a report export button on the Dashboard.
- **Email notifications** — send an email via Nodemailer when a student
  receives an offer (mirrors Salesforce Email Alerts in a Flow).
