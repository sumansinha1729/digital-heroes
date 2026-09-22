import { TopNav } from "./TopNav.jsx";

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
