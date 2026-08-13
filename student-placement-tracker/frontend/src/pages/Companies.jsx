import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import { CompaniesAPI } from "../api/api.js";

const emptyForm = {
  name: "", industry: "", job_role: "", package_ctc: "", eligibility_criteria: "", required_skills: "", drive_date: "",
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => CompaniesAPI.list(search ? { search } : {}).then(setCompanies);
  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setError(""); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, package_ctc: parseFloat(form.package_ctc) };
      if (editing) await CompaniesAPI.update(editing.id, payload);
      else await CompaniesAPI.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this company and all related applications?")) return;
    await CompaniesAPI.remove(id);
    load();
  };

  return (
    <div>
      <Topbar
        title="Companies"
        subtitle="Recruiting organizations and their drive details"
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Company
          </button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-9" placeholder="Search by name, role or industry…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        emptyLabel="No companies yet. Add your first recruiting company."
        rows={companies}
        columns={[
          { key: "name", header: "Company", render: (c) => (
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="text-xs text-muted">{c.industry}</p>
              </div>
            ) },
          { key: "job_role", header: "Role" },
          { key: "package_ctc", header: "CTC", render: (c) => <span className="font-mono font-semibold text-placed">₹{c.package_ctc} LPA</span> },
          { key: "required_skills", header: "Required Skills", render: (c) => <span className="text-xs text-muted">{c.required_skills}</span> },
          { key: "drive_date", header: "Drive Date", render: (c) => <span className="font-mono text-xs">{c.drive_date || "—"}</span> },
          { key: "actions", header: "", render: (c) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-canvas text-muted hover:text-accent transition" onClick={() => openEdit(c)}>
                  <Pencil size={15} />
                </button>
                <button className="p-1.5 rounded-md hover:bg-danger/10 text-muted hover:text-danger transition" onClick={() => remove(c.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ) },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Company" : "Add Company"} wide>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" required>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Industry" required>
              <input className="input" required value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </Field>
            <Field label="Job Role" required>
              <input className="input" required value={form.job_role} onChange={(e) => setForm({ ...form, job_role: e.target.value })} />
            </Field>
            <Field label="Package (LPA)" required>
              <input className="input" type="number" step="0.1" required value={form.package_ctc} onChange={(e) => setForm({ ...form, package_ctc: e.target.value })} />
            </Field>
            <Field label="Drive Date">
              <input className="input" type="date" value={form.drive_date || ""} onChange={(e) => setForm({ ...form, drive_date: e.target.value })} />
            </Field>
          </div>
          <Field label="Eligibility Criteria">
            <input className="input" value={form.eligibility_criteria} onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })} />
          </Field>
          <Field label="Required Skills (comma separated)">
            <input className="input" value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Save Changes" : "Add Company"}</button>
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
