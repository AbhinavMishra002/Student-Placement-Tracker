import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { StudentsAPI } from "../api/api.js";

const emptyForm = {
  name: "", roll_number: "", branch: "BCA", cgpa: "", skills: "", email: "", phone: "", placement_status: "Not Placed",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => StudentsAPI.list(search ? { search } : {}).then(setStudents);

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setError(""); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, cgpa: parseFloat(form.cgpa) };
      if (editing) await StudentsAPI.update(editing.id, payload);
      else await StudentsAPI.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this student and all related applications?")) return;
    await StudentsAPI.remove(id);
    load();
  };

  return (
    <div>
      <Topbar
        title="Students"
        subtitle="Master record of every registered student"
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Student
          </button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9"
          placeholder="Search by name, roll no. or skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        emptyLabel="No students found. Add your first student to get started."
        rows={students}
        columns={[
          { key: "name", header: "Name", render: (s) => (
              <div>
                <p className="font-medium text-ink">{s.name}</p>
                <p className="text-xs text-muted font-mono">{s.roll_number}</p>
              </div>
            ) },
          { key: "branch", header: "Branch" },
          { key: "cgpa", header: "CGPA", render: (s) => <span className="font-mono">{s.cgpa.toFixed(2)}</span> },
          { key: "skills", header: "Skills", render: (s) => <span className="text-xs text-muted">{s.skills}</span> },
          { key: "email", header: "Email" },
          { key: "placement_status", header: "Status", render: (s) => <StatusBadge status={s.placement_status} /> },
          { key: "actions", header: "", render: (s) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-canvas text-muted hover:text-accent transition" onClick={() => openEdit(s)}>
                  <Pencil size={15} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition" onClick={() => remove(s.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Roll Number" required>
              <input className="input font-mono" required value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} />
            </Field>
            <Field label="Branch" required>
              <input className="input" required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
            </Field>
            <Field label="CGPA" required>
              <input className="input" type="number" step="0.01" min="0" max="10" required value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
            </Field>
            <Field label="Email" required>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Skills (comma separated)">
            <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </Field>
          <Field label="Placement Status">
            <select className="input" value={form.placement_status} onChange={(e) => setForm({ ...form, placement_status: e.target.value })}>
              <option>Not Placed</option>
              <option>In Process</option>
              <option>Placed</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Student"}</button>
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
