import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getCharities } from "../api/charities.js";
import { createSubscription } from "../api/subscriptions.js";
import { TopNav } from "../components/layout/TopNav.jsx";
import { TextField } from "../components/ui/TextField.jsx";
import { Button } from "../components/ui/Button.jsx";
import { ApiError } from "../api/client.js";

const MIN_CHARITY_PERCENTAGE = 10;
const DEFAULT_CHARITY_PERCENTAGE = 10;

function SectionLabel({ children }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-text-primary-dark/50">
      {children}
    </span>
  );
}

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("MONTHLY");
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(DEFAULT_CHARITY_PERCENTAGE);

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCharities()
      .then(({ charities }) => {
        setCharities(charities);
        if (charities.length > 0) setCharityId(charities[0].id);
      })
      .catch(() => setFormError("Could not load charities. Please refresh and try again."));
  }, []);

  const selectedCharity = charities.find((c) => c.id === charityId);
  const fee = plan === "MONTHLY" ? 499 : 4999;
  const cadence = plan === "MONTHLY" ? "monthly" : "yearly";
  const charityShare = Math.round((fee * charityPercentage) / 100);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!charityId) {
      setFormError("Please choose a charity to support");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ email, password, fullName });
      const { checkoutUrl } = await createSubscription({ plan, charityId, charityPercentage });
      window.location.href = checkoutUrl;
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary-dark">
      <TopNav variant="dark" />

      <div className="flex flex-1 justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface-dark p-8 shadow-2xl md:p-10">
          <h1 className="font-serif text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-text-primary-dark/60">
            One form: your account, your plan, and the charity your subscription supports.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <SectionLabel>Your details</SectionLabel>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  id="fullName"
                  label="Full name"
                  variant="dark"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="sm:col-span-2"
                />
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
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-8">
              <SectionLabel>Plan</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan("MONTHLY")}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    plan === "MONTHLY"
                      ? "border-accent-action bg-accent-action/10"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  <div className="font-semibold">Monthly</div>
                  <div className="mt-0.5 text-sm text-text-primary-dark/60">₹499 / month</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("YEARLY")}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    plan === "YEARLY"
                      ? "border-accent-action bg-accent-action/10"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  <div className="font-semibold">Yearly</div>
                  <div className="mt-0.5 text-sm text-text-primary-dark/60">₹4,999 / year</div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-8">
              <SectionLabel>Choose a charity to support</SectionLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {charities.map((charity) => (
                  <button
                    key={charity.id}
                    type="button"
                    onClick={() => setCharityId(charity.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      charityId === charity.id
                        ? "border-accent-charity bg-accent-charity/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold">{charity.name}</div>
                    <div className="mt-1 text-sm leading-snug text-text-primary-dark/60 line-clamp-2">
                      {charity.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-2 rounded-xl bg-white/5 p-4">
                <label htmlFor="charityPercentage" className="text-sm font-medium">
                  Contribution: {charityPercentage}%
                </label>
                <input
                  id="charityPercentage"
                  type="range"
                  min={MIN_CHARITY_PERCENTAGE}
                  max={100}
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(Number(e.target.value))}
                  className="mt-3 w-full accent-accent-charity"
                />
                <p className="mt-3 text-sm text-text-primary-dark/70">
                  <span className="font-semibold text-accent-charity">₹{charityShare}</span> of
                  your ₹{fee} {cadence} fee goes to{" "}
                  <span className="font-semibold">
                    {selectedCharity ? selectedCharity.name : "your chosen charity"}
                  </span>
                  .
                </p>
              </div>
            </div>

            {formError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{formError}</p>
            )}

            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full py-3">
              {isSubmitting ? "Setting up your account…" : "Continue to payment"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-primary-dark/60">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent-action hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
