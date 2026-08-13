import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { PlacementsAPI, ApplicationsAPI } from "../api/api.js";

const emptyForm = {
  application_id: "", offer_status: "Offer Extended", selected_company: "", final_package: "", joining_date: "", placement_confirmed: 0,
};

export default function Placements() {
  const [placements, setPlacements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => PlacementsAPI.list().then(setPlacements);
  useEffect(() => { load(); }, []);
  useEffect(() => {
    // Only "Offered" applications without an existing placement make sense here,
    // but we show all offered applications for simplicity.
    ApplicationsAPI.list({ status: "Offered" }).then(setApplications);
  }, [modalOpen]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setError(""); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, final_package: parseFloat(form.final_package) };
      if (editing) await PlacementsAPI.update(editing.id, payload);
      else await PlacementsAPI.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this placement record?")) return;
    await PlacementsAPI.remove(id);
    load();
  };

  return (
    <div>
      <Topbar
        title="Placements"
        subtitle="Final offers, packages, and confirmed joinings"
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Record Placement
          </button>
        }
      />

      <DataTable
        emptyLabel="No placements recorded yet. Once an application is Offered, record it here."
        rows={placements}
        columns={[
          { key: "student_name", header: "Student", render: (p) => (
              <div><p className="font-medium text-ink">{p.student_name}</p><p className="text-xs text-muted font-mono">{p.roll_number}</p></div>
            ) },
          { key: "selected_company", header: "Company" },
          { key: "final_package", header: "Package", render: (p) => <span className="font-mono font-semibold text-placed">₹{p.final_package} LPA</span> },
          { key: "joining_date", header: "Joining Date", render: (p) => <span className="font-mono text-xs">{p.joining_date || "—"}</span> },
          { key: "offer_status", header: "Offer Status", render: (p) => <StatusBadge status={p.offer_status} /> },
          { key: "placement_confirmed", header: "Confirmed", render: (p) => (p.placement_confirmed ? "✅" : "—") },
          { key: "actions", header: "", render: (p) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-canvas text-muted hover:text-accent transition" onClick={() => openEdit(p)}>
                  <Pencil size={15} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition" onClick={() => remove(p.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Placement" : "Record Placement"}>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <Field label="Application" required>
            <select className="input" required disabled={!!editing} value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}>
              <option value="">Select an offered application</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>{a.student_name} → {a.company_name} ({a.job_role})</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Selected Company" required>
              <input className="input" required value={form.selected_company} onChange={(e) => setForm({ ...form, selected_company: e.target.value })} />
            </Field>
            <Field label="Final Package (LPA)" required>
              <input className="input" type="number" step="0.1" required value={form.final_package} onChange={(e) => setForm({ ...form, final_package: e.target.value })} />
            </Field>
            <Field label="Joining Date">
              <input className="input" type="date" value={form.joining_date || ""} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
            </Field>
            <Field label="Offer Status">
              <select className="input" value={form.offer_status} onChange={(e) => setForm({ ...form, offer_status: e.target.value })}>
                <option>Offer Extended</option>
                <option>Accepted</option>
                <option>Declined</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={!!form.placement_confirmed} onChange={(e) => setForm({ ...form, placement_confirmed: e.target.checked ? 1 : 0 })} />
            Confirm placement (marks student as "Placed")
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Record Placement"}</button>
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
