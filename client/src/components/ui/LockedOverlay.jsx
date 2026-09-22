import { Link } from "react-router-dom";
import { Button } from "./Button.jsx";

export function LockedOverlay({ locked, children }) {
  if (!locked) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link to="/dashboard#subscribe">
          <Button variant="primary">Subscribe to unlock</Button>
        </Link>
      </div>
    </div>
  );
}
