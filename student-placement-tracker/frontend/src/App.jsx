import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Companies from "./pages/Companies.jsx";
import Applications from "./pages/Applications.jsx";
import Interviews from "./pages/Interviews.jsx";
import Placements from "./pages/Placements.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-[1400px]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/placements" element={<Placements />} />
        </Routes>
      </main>
    </div>
  );
}
