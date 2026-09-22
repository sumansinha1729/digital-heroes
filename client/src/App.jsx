import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { CharityDirectory } from "./pages/CharityDirectory.jsx";
import { CharityProfile } from "./pages/CharityProfile.jsx";
import { RequireAuth } from "./components/layout/RequireAuth.jsx";
import { RequireAdmin } from "./components/layout/RequireAdmin.jsx";
import { AdminCharities } from "./pages/admin/AdminCharities.jsx";
import { AdminDraws } from "./pages/admin/AdminDraws.jsx";
import { AdminWinners } from "./pages/admin/AdminWinners.jsx";
import { AdminUsers } from "./pages/admin/AdminUsers.jsx";
import { AdminReports } from "./pages/admin/AdminReports.jsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/charities" element={<CharityDirectory />} />
      <Route path="/charities/:id" element={<CharityProfile />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/charities"
        element={
          <RequireAdmin>
            <AdminCharities />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/draws"
        element={
          <RequireAdmin>
            <AdminDraws />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/winners"
        element={
          <RequireAdmin>
            <AdminWinners />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsers />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireAdmin>
            <AdminReports />
          </RequireAdmin>
        }
      />
    </Routes>
  );
}
