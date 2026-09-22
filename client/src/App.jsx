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
    </Routes>
  );
}
