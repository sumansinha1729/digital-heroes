import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../ui/Button.jsx";

export function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8">
      <Link to="/" className="font-serif text-xl font-medium text-text-primary">
        Digital Heroes
      </Link>

      <nav className="flex items-center gap-3">
        <Link to="/charities" className="text-sm font-medium text-text-primary hover:text-accent-charity">
          Charities
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-text-primary hover:text-accent-action">
              Dashboard
            </Link>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-text-primary hover:text-accent-action">
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
