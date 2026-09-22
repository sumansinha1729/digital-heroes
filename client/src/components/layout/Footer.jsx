import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-4">
          <Link to="/charities" className="hover:text-text-primary">Charity directory</Link>
          <Link to="/login" className="hover:text-text-primary">Log in</Link>
          <a href="#" className="hover:text-text-primary">About</a>
          <a href="#" className="hover:text-text-primary">Contact</a>
        </nav>
        <p className="max-w-md">
          A portion of every subscription funds the monthly prize pool and your chosen charity.
          Draw odds and pool distribution are published after every draw.
        </p>
      </div>
    </footer>
  );
}
