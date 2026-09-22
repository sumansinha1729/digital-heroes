import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../ui/Button.jsx";

export function TopNav({ variant = "light" }) {
  const { isAuthenticated, logout } = useAuth();
  const textColor = variant === "dark" ? "text-text-primary-dark" : "text-text-primary";
  const secondaryButtonClass = variant === "dark" ? "border-white/30 text-text-primary-dark hover:bg-white/10" : "";

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8">
      <Link to="/" className={`font-serif text-xl font-medium ${textColor}`}>
        Digital Heroes
      </Link>

      <nav className="flex items-center gap-3">
        <Link to="/charities" className={`text-sm font-medium hover:text-accent-charity ${textColor}`}>
          Charities
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={`text-sm font-medium hover:text-accent-action ${textColor}`}>
              Dashboard
            </Link>
            <Button variant="secondary" className={secondaryButtonClass} onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className={`text-sm font-medium hover:text-accent-action ${textColor}`}>
              Log in
            </Link>
            <Link to="/signup">
              <Button variant="primary">Subscribe</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
