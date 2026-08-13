const STYLES = {
  // Student placement status
  "Placed": "bg-placed/10 text-placed",
  "In Process": "bg-pending/10 text-pending",
  "Not Placed": "bg-muted/10 text-muted",
  // Application status
  "Applied": "bg-accent/10 text-accent",
  "Shortlisted": "bg-pending/10 text-pending",
  "Interviewing": "bg-pending/10 text-pending",
  "Offered": "bg-placed/10 text-placed",
  "Rejected": "bg-danger/10 text-danger",
  "Withdrawn": "bg-muted/10 text-muted",
  // Interview result
  "Pending": "bg-pending/10 text-pending",
  "Pass": "bg-placed/10 text-placed",
  "Fail": "bg-danger/10 text-danger",
  // Placement offer status
  "Offer Extended": "bg-pending/10 text-pending",
  "Accepted": "bg-placed/10 text-placed",
  "Declined": "bg-danger/10 text-danger",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-muted/10 text-muted";
  return <span className={`badge ${cls}`}>{status}</span>;
}
