export default function StatCard({ label, value, sub, icon: Icon, tone = "accent" }) {
  const toneMap = {
    accent: "bg-accent/10 text-accent",
    placed: "bg-placed/10 text-placed",
    pending: "bg-pending/10 text-pending",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</p>
        <p className="font-display text-3xl font-bold text-ink mt-2">{value}</p>
        {sub && <p className="text-xs text-muted mt-1.5">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
