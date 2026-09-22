import { AdminSidebar } from "./AdminSidebar.jsx";

export function AdminShell({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
