// database/db.js
// Sets up a local SQLite database file (placement.db) and creates the
// five core tables that mirror the Salesforce custom objects:
// Student, Company, Application, Interview, Placement.

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "placement.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- Schema ----------
// Master-Detail style relationships (like Salesforce Master-Detail/Lookup):
//   Student  1 --- * Application
//   Company  1 --- * Application
//   Application 1 --- * Interview
//   Application 1 --- 1 Placement (a successful application yields one placement)

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  roll_number     TEXT NOT NULL UNIQUE,
  branch          TEXT NOT NULL,
  cgpa            REAL NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  skills          TEXT,
  email           TEXT NOT NULL,
  phone           TEXT,
  placement_status TEXT NOT NULL DEFAULT 'Not Placed'
    CHECK (placement_status IN ('Not Placed','In Process','Placed')),
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS companies (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT NOT NULL,
  industry            TEXT NOT NULL,
  job_role            TEXT NOT NULL,
  package_ctc         REAL NOT NULL,
  eligibility_criteria TEXT,
  required_skills     TEXT,
  drive_date          TEXT,
  created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id       INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_id       INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  application_date TEXT NOT NULL DEFAULT (date('now')),
  status           TEXT NOT NULL DEFAULT 'Applied'
    CHECK (status IN ('Applied','Shortlisted','Interviewing','Offered','Rejected','Withdrawn')),
  resume_submitted INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, company_id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id   INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round            TEXT NOT NULL,
  interview_date   TEXT NOT NULL,
  result           TEXT NOT NULL DEFAULT 'Pending'
    CHECK (result IN ('Pending','Pass','Fail')),
  feedback         TEXT,
  interviewer      TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS placements (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id     INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  offer_status       TEXT NOT NULL DEFAULT 'Offer Extended'
    CHECK (offer_status IN ('Offer Extended','Accepted','Declined')),
  selected_company   TEXT NOT NULL,
  final_package      REAL NOT NULL,
  joining_date       TEXT,
  placement_confirmed INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
`);

module.exports = db;
