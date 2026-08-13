import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  FileText,
  MessagesSquare,
  Award,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/interviews", label: "Interviews", icon: MessagesSquare },
  { to: "/placements", label: "Placements", icon: Award },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-ink text-white/90 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-display font-bold text-sm">
            P
          </div>
          <div>
            <p className="font-display font-bold text-[15px] leading-tight text-white">PlacePath</p>
            <p className="text-[11px] text-white/40 leading-tight">Campus Placement Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10 text-[11px] text-white/35 leading-relaxed">
        Salesforce concepts, rebuilt as a
        <br />
        standalone full-stack app.
      </div>
    </aside>
  );
}
