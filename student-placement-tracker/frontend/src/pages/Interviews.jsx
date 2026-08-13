import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { InterviewsAPI, ApplicationsAPI } from "../api/api.js";

const emptyForm = { application_id: "", round: "", interview_date: "", result: "Pending", feedback: "", interviewer: "" };

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => InterviewsAPI.list().then(setInterviews);
  useEffect(() => { load(); }, []);
  useEffect(() => { ApplicationsAPI.list().then(setApplications); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (i) => { setEditing(i); setForm({ ...i }); setError(""); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await InterviewsAPI.update(editing.id, form);
      else await InterviewsAPI.create(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this interview record?")) return;
    await InterviewsAPI.remove(id);
    load();
  };

  return (
    <div>
      <Topbar
        title="Interviews"
        subtitle="Every interview round, result, and feedback note"
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Log Interview
          </button>
        }
      />

      <DataTable
        emptyLabel="No interview rounds logged yet."
        rows={interviews}
        columns={[
          { key: "student_name", header: "Student" },
          { key: "company_name", header: "Company" },
          { key: "round", header: "Round" },
          { key: "interview_date", header: "Date", render: (i) => <span className="font-mono text-xs">{i.interview_date}</span> },
          { key: "interviewer", header: "Interviewer" },
          { key: "result", header: "Result", render: (i) => <StatusBadge status={i.result} /> },
          { key: "feedback", header: "Feedback", render: (i) => <span className="text-xs text-muted max-w-[220px] block truncate">{i.feedback}</span> },
          { key: "actions", header: "", render: (i) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-canvas text-muted hover:text-accent transition" onClick={() => openEdit(i)}>
                  <Pencil size={15} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition" onClick={() => remove(i.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Interview" : "Log Interview"}>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <Field label="Application" required>
            <select className="input" required value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}>
              <option value="">Select an application</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>{a.student_name} → {a.company_name} ({a.job_role})</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Round" required>
              <input className="input" required placeholder="e.g. Technical Round 1" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
            </Field>
            <Field label="Interview Date" required>
              <input className="input" type="date" required value={form.interview_date || ""} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} />
            </Field>
            <Field label="Result">
              <select className="input" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}>
                <option>Pending</option>
                <option>Pass</option>
                <option>Fail</option>
              </select>
            </Field>
            <Field label="Interviewer">
              <input className="input" value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} />
            </Field>
          </div>
          <Field label="Feedback">
            <textarea className="input" rows={3} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Log Interview"}</button>
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
