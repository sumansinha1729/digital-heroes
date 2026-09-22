import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { TextField } from "../components/ui/TextField.jsx";
import { getCharity } from "../api/charities.js";
import { createDonation } from "../api/donations.js";
import { ApiError } from "../api/client.js";

function DonationForm({ charityId }) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("submitting");
    try {
      await createDonation({ charityId, amount: Number(amount) });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <Card>
        <p className="font-semibold text-accent-charity">Thank you for your donation!</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">Support this charity</h2>
      <p className="mt-1 text-sm text-text-muted">
        Make a one-time donation, separate from any subscription.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <TextField
          id="donationAmount"
          label="Amount (₹)"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button type="submit" variant="charity" disabled={status === "submitting"} className="w-full">
          {status === "submitting" ? "Donating…" : "Donate"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}

export function CharityProfile() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [charity, setCharity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCharity(id)
      .then(({ charity }) => setCharity(charity))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="p-8 text-center text-text-muted">Loading…</div>
      </PageShell>
    );
  }

  if (notFound || !charity) {
    return (
      <PageShell>
        <div className="p-8 text-center text-text-muted">Charity not found.</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="bg-accent-charity/5 px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {charity.imageUrl ? (
            <img
              src={charity.imageUrl}
              alt=""
              className="aspect-21/9 w-full rounded-2xl object-cover"
            />
          ) : (
            <div
              className="flex aspect-21/9 w-full items-center justify-center rounded-2xl bg-accent-charity/15"
              aria-hidden="true"
            >
              <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none">
                <circle cx="15" cy="20" r="9" className="stroke-accent-charity" strokeWidth="2" opacity="0.6" />
                <circle cx="25" cy="20" r="9" className="stroke-accent-charity" strokeWidth="2" opacity="0.6" />
              </svg>
            </div>
          )}
          <h1 className="mt-6 font-serif text-3xl md:text-4xl">{charity.name}</h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-6 px-4 py-8 md:grid-cols-3 md:gap-8 md:px-8">
        <div className="md:col-span-2">
          <p className="text-base leading-relaxed text-text-primary">{charity.description}</p>

          {charity.events.length > 0 && (
            <div className="mt-8">
              <h2 className="font-sans text-lg font-semibold">Upcoming events</h2>
              <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
                {charity.events.map((event) => (
                  <Card key={event.id} className="w-64 shrink-0">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {new Date(event.eventDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-2 text-sm text-text-muted line-clamp-3">{event.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {isAuthenticated ? (
            <DonationForm charityId={charity.id} />
          ) : (
            <Card>
              <p className="text-sm text-text-muted">Sign up to support {charity.name}.</p>
              <Link to="/signup" className="mt-3 inline-block">
                <Button variant="charity">Sign up</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
