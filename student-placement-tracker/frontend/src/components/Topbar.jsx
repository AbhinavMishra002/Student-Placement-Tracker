export default function Topbar({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
