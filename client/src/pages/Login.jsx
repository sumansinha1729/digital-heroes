import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { TopNav } from "../components/layout/TopNav.jsx";
import { TextField } from "../components/ui/TextField.jsx";
import { Button } from "../components/ui/Button.jsx";
import { ApiError } from "../api/client.js";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary-dark">
      <TopNav variant="dark" />

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-110 rounded-2xl border border-white/10 bg-surface-dark p-8 shadow-2xl md:p-10">
          <h1 className="font-serif text-3xl">Log in</h1>
          <p className="mt-2 text-sm text-text-primary-dark/60">
            Welcome back — track your scores and check your draw entries.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <TextField
              id="email"
              label="Email"
              type="email"
              variant="dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="dark"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="-mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => alert("Forgot password — coming soon")}
                className="text-sm text-text-primary-dark/60 hover:text-text-primary-dark hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {formError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>
            )}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full py-3">
              {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-primary-dark/60">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-accent-action hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
