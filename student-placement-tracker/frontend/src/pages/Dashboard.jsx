import { useEffect, useState } from "react";
import {
  Users, Building2, FileText, Award, TrendingUp, IndianRupee,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import Topbar from "../components/Topbar.jsx";
import StatCard from "../components/StatCard.jsx";
import { DashboardAPI } from "../api/api.js";

const FUNNEL_COLORS = ["#4F5DFF", "#6C7AFF", "#F2A93B", "#1FAF6E", "#E5484D", "#6B7292"];
const PIE_COLORS = { "Placed": "#1FAF6E", "In Process": "#F2A93B", "Not Placed": "#C9CCE0" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardAPI.stats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <Topbar title="Dashboard" subtitle="Loading placement overview…" />
      </div>
    );
  }

  const maxFunnel = Math.max(...stats.funnel.map((f) => f.count), 1);

  return (
    <div>
      <Topbar
        title="Placement Dashboard"
        subtitle="Real-time overview of the campus recruitment pipeline"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} tone="accent" />
        <StatCard label="Partner Companies" value={stats.totalCompanies} icon={Building2} tone="accent" />
        <StatCard label="Applications Filed" value={stats.totalApplications} icon={FileText} tone="pending" />
        <StatCard
          label="Placement Rate"
          value={`${stats.placementRate}%`}
          sub={`${stats.placedStudents} of ${stats.totalStudents} students placed`}
          icon={TrendingUp}
          tone="placed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Offers Confirmed" value={stats.totalPlacements} icon={Award} tone="placed" />
        <StatCard label="Average Package" value={`₹${stats.avgPackage} LPA`} icon={IndianRupee} tone="accent" />
        <StatCard label="Highest Package" value={`₹${stats.highestPackage} LPA`} icon={IndianRupee} tone="placed" />
      </div>

      {/* Signature element: recruitment funnel — a genuine sequence,
          Applied -> Shortlisted -> Interviewing -> Offered, so the
          stepped bar width actually encodes drop-off at each stage. */}
      <div className="card p-6 mb-8">
        <h3 className="font-display font-semibold text-base text-ink mb-1">Recruitment Pipeline</h3>
        <p className="text-xs text-muted mb-5">How applications move through each stage right now</p>
        <div className="space-y-3">
          {stats.funnel.map((stage, i) => (
            <div key={stage.status} className="flex items-center gap-4">
              <div className="w-28 text-xs font-semibold text-muted shrink-0">{stage.status}</div>
              <div className="flex-1 h-8 bg-canvas rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center justify-end px-2.5 text-white text-xs font-semibold transition-all"
                  style={{
                    width: `${Math.max((stage.count / maxFunnel) * 100, stage.count > 0 ? 6 : 0)}%`,
                    backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                  }}
                >
                  {stage.count > 0 && stage.count}
                </div>
              </div>
              <div className="w-8 text-sm font-mono font-semibold text-ink text-right">{stage.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Branch-wise placement */}
        <div className="card p-6 lg:col-span-3">
          <h3 className="font-display font-semibold text-base text-ink mb-1">Branch-wise Placements</h3>
          <p className="text-xs text-muted mb-4">Total students vs. students placed, per branch</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.branchDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E6F0" vertical={false} />
              <XAxis dataKey="branch" tick={{ fontSize: 12, fill: "#6B7292" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7292" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#F5F6FA" }} contentStyle={{ borderRadius: 10, border: "1px solid #E4E6F0", fontSize: 12 }} />
              <Bar dataKey="total" fill="#C9CCE0" name="Total Students" radius={[6, 6, 0, 0]} />
              <Bar dataKey="placed" fill="#1FAF6E" name="Placed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown pie */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-base text-ink mb-1">Student Status</h3>
          <p className="text-xs text-muted mb-4">Overall placement status distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats.statusBreakdown}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {stats.statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={PIE_COLORS[entry.status] || "#4F5DFF"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E4E6F0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {stats.statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[s.status] || "#4F5DFF" }} />
                {s.status} ({s.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top recruiters */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-base text-ink mb-1">Top Recruiting Companies</h3>
        <p className="text-xs text-muted mb-4">Ranked by number of confirmed offers</p>
        {stats.topCompanies.length === 0 ? (
          <p className="text-sm text-muted">No offers recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {stats.topCompanies.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-6 text-xs font-mono text-muted">#{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-ink">{c.name}</span>
                <span className="text-sm font-semibold text-placed">{c.offers} offer{c.offers !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
