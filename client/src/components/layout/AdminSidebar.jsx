import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/draws", label: "Draws" },
  { to: "/admin/charities", label: "Charities" },
  { to: "/admin/winners", label: "Winners" },
  { to: "/admin/reports", label: "Reports" },
];

export function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col bg-bg text-text-primary-dark">
      <div className="px-5 py-6">
        <span className="font-serif text-lg">Digital Heroes</span>
        <div className="text-xs text-text-primary-dark/50">Admin</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent-action bg-white/5 text-text-primary-dark"
                  : "border-transparent text-text-primary-dark/60 hover:text-text-primary-dark"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary-dark/60 hover:text-text-primary-dark"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
