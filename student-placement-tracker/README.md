# PlacePath — Student Placement Tracker

A full-stack campus placement management system, rebuilt from a Salesforce
internship project brief into a standalone web app you can run entirely on
your own machine in VS Code — no Salesforce org required.

**Stack:** React (Vite + Tailwind) frontend · Node.js/Express backend · SQLite database.

See [`docs/salesforce-mapping.md`](./docs/salesforce-mapping.md) for how each
Salesforce concept (Custom Objects, Flows, Reports, LWC, etc.) maps to the
code here — handy if you need to justify design decisions in your internship
report.

## What it does

- **Students** — registration, CGPA, branch, skills, live placement status.
- **Companies** — recruiting drives, eligibility, package, required skills.
- **Applications** — links a Student to a Company, tracks pipeline status.
- **Interviews** — multiple rounds per application, result & feedback.
- **Placements** — final offer, package, joining date.
- **Dashboard** — stat cards, a recruitment funnel, branch-wise placement
  chart, status breakdown, and a top-recruiters leaderboard, all computed
  live from the database.
- **Automation** — the backend automatically keeps records in sync, the same
  way a Salesforce Flow/Trigger would:
  - An Interview marked **Fail** auto-rejects the Application.
  - An Interview marked **Pass** moves the Application to *Interviewing*.
  - Confirming a Placement marks the Application **Offered** and the Student **Placed**.

## Project structure

```
student-placement-tracker/
├── backend/                 Express API + SQLite database
│   ├── database/
│   │   ├── db.js            Schema (tables, constraints, indexes)
│   │   └── seed.js          Sample data loader
│   ├── routes/               students, companies, applications, interviews, placements, dashboard
│   └── server.js
├── frontend/                 React (Vite) app
│   └── src/
│       ├── api/api.js         Axios calls to the backend
│       ├── components/        Sidebar, StatCard, DataTable, Modal, StatusBadge…
│       └── pages/              Dashboard, Students, Companies, Applications, Interviews, Placements
└── docs/
    └── salesforce-mapping.md
```

## Requirements

- [Node.js](https://nodejs.org) v18 or newer (includes npm). Check with `node -v`.
- VS Code (or any editor/terminal).

## Setup — run these steps in order

### 1. Backend

Open a terminal in the project root:

```bash
cd backend
npm install
npm run seed     # creates backend/database/placement.db with sample data
npm run dev      # starts the API on http://localhost:5000
```

Leave this terminal running. Visit `http://localhost:5000/api/health` in a
browser — you should see `{"status":"ok", ...}`.

> If `npm run dev` isn't recognized, run `npm start` instead (it just won't
> auto-restart on file changes).

### 2. Frontend

Open a **second** terminal (keep the backend running in the first):

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`. Open it in
your browser — that's the app.

The frontend is pre-configured (see `frontend/vite.config.js`) to proxy any
`/api/...` request to `http://localhost:5000`, so both servers just need to
be running side by side; no extra configuration needed.

### 3. Re-seeding data

If you want to reset to the sample dataset at any point:

```bash
cd backend
npm run seed
```

This clears and reinserts all records. Your own added records will be lost,
so only run it when you want a clean slate.

## Troubleshooting

- **Port already in use** — change `PORT` in `backend/server.js` (or set the
  `PORT` env variable) and update the proxy target in `frontend/vite.config.js`
  to match.
- **`better-sqlite3` fails to install** — it needs a C++ build toolchain on
  some systems. On Windows, installing [Node.js LTS](https://nodejs.org) and
  running `npm install` again usually pulls a prebuilt binary automatically.
  If it still fails, run `npm install --build-from-source` inside `backend/`.
- **CORS errors in the browser console** — make sure the backend is running
  on port 5000 before starting the frontend.

## Ideas to extend this for a stronger submission

- Add login/authentication for placement officers (JWT).
- Add CSV/PDF export for the dashboard reports.
- Add email notifications when an offer is recorded.
- Add pagination and sorting to the data tables.

See `docs/salesforce-mapping.md` for more extension ideas tied directly to
Salesforce features you may want to mention having replicated.
