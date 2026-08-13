import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { ApplicationsAPI, StudentsAPI, CompaniesAPI } from "../api/api.js";

const STATUSES = ["Applied", "Shortlisted", "Interviewing", "Offered", "Rejected", "Withdrawn"];
const emptyForm = { student_id: "", company_id: "", application_date: "", status: "Applied", resume_submitted: 1 };

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => ApplicationsAPI.list(statusFilter ? { status: statusFilter } : {}).then(setApplications);

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    StudentsAPI.list().then(setStudents);
    CompaniesAPI.list().then(setCompanies);
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setError(""); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await ApplicationsAPI.update(editing.id, form);
      else await ApplicationsAPI.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this application and its interviews/placement?")) return;
    await ApplicationsAPI.remove(id);
    load();
  };

  return (
    <div>
      <Topbar
        title="Applications"
        subtitle="Every job application, from submission to outcome"
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Application
          </button>
        }
      />

      <div className="flex gap-2 mb-5">
        <select className="input max-w-[200px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        emptyLabel="No applications yet. Create one to link a student with a company."
        rows={applications}
        columns={[
          { key: "student_name", header: "Student", render: (a) => (
              <div><p className="font-medium text-ink">{a.student_name}</p><p className="text-xs text-muted font-mono">{a.roll_number}</p></div>
            ) },
          { key: "company_name", header: "Company", render: (a) => (
              <div><p className="font-medium text-ink">{a.company_name}</p><p className="text-xs text-muted">{a.job_role}</p></div>
            ) },
          { key: "application_date", header: "Applied On", render: (a) => <span className="font-mono text-xs">{a.application_date}</span> },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
          { key: "resume_submitted", header: "Resume", render: (a) => (a.resume_submitted ? "✅" : "—") },
          { key: "actions", header: "", render: (a) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-canvas text-muted hover:text-accent transition" onClick={() => openEdit(a)}>
                  <Pencil size={15} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition" onClick={() => remove(a.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Application" : "New Application"}>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <Field label="Student" required>
            <select className="input" required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">Select a student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </select>
          </Field>
          <Field label="Company" required>
            <select className="input" required value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
              <option value="">Select a company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.job_role}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Application Date">
              <input className="input" type="date" value={form.application_date || ""} onChange={(e) => setForm({ ...form, application_date: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={!!form.resume_submitted} onChange={(e) => setForm({ ...form, resume_submitted: e.target.checked ? 1 : 0 })} />
            Resume submitted
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Create Application"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted mb-1.5">{label}{required && <span className="text-danger"> *</span>}</span>
      {children}
    </label>
  );
}
