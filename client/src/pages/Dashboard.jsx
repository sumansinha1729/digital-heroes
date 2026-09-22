import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { PageShell } from "../components/layout/PageShell.jsx";
import { LockedOverlay } from "../components/ui/LockedOverlay.jsx";
import { Button } from "../components/ui/Button.jsx";
import { HeaderBand } from "./dashboard/HeaderBand.jsx";
import { ScoreModule } from "./dashboard/ScoreModule.jsx";
import { CharityModule } from "./dashboard/CharityModule.jsx";
import { ParticipationModule } from "./dashboard/ParticipationModule.jsx";
import { WinningsModule } from "./dashboard/WinningsModule.jsx";
import { getScores } from "../api/scores.js";
import { getMySubscription, createSubscription } from "../api/subscriptions.js";
import { getCharities } from "../api/charities.js";

export function Dashboard() {
  const { user } = useAuth();

  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadScores = useCallback(async () => {
    const { scores } = await getScores();
    setScores(scores);
  }, []);

  const loadSubscription = useCallback(async () => {
    const { subscription } = await getMySubscription();
    setSubscription(subscription);
  }, []);

  useEffect(() => {
    Promise.all([loadScores(), loadSubscription()]).finally(() => setIsLoading(false));
  }, [loadScores, loadSubscription]);

  const isSubscribed = subscription?.status === "ACTIVE";

  if (isLoading) {
    return (
      <PageShell>
        <div className="p-8 text-center text-text-muted">Loading your dashboard…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <HeaderBand user={user} subscription={subscription} />

      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        {!isSubscribed && (
          <div id="subscribe" className="mb-6 rounded-2xl border border-accent-action/30 bg-accent-action/5 p-4">
            <SubscribeCta onSubscribed={loadSubscription} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LockedOverlay locked={!isSubscribed}>
            <ScoreModule scores={scores} onScoresChanged={loadScores} />
          </LockedOverlay>

          {subscription && (
            <LockedOverlay locked={!isSubscribed}>
              <CharityModule subscription={subscription} onSubscriptionChanged={loadSubscription} />
            </LockedOverlay>
          )}

          <LockedOverlay locked={!isSubscribed}>
            <ParticipationModule />
          </LockedOverlay>

          <LockedOverlay locked={!isSubscribed}>
            <WinningsModule />
          </LockedOverlay>
        </div>
      </div>
    </PageShell>
  );
}

function SubscribeCta({ onSubscribed }) {
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCharities().then(({ charities }) => {
      setCharities(charities);
      if (charities.length > 0) setCharityId(charities[0].id);
    });
  }, []);

  async function handleSubscribe() {
    if (!charityId) return;
    setError("");
    setIsSubmitting(true);
    try {
      const { checkoutUrl } = await createSubscription({
        plan: "MONTHLY",
        charityId,
        charityPercentage: 10,
      });
      window.location.href = checkoutUrl;
    } catch {
      setError("Could not start checkout. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Subscribe to unlock scores, draws, and winnings.</p>
        <p className="text-sm text-text-muted">Starts at ₹499/month — 10% goes to your chosen charity.</p>
      </div>
      <Button variant="primary" disabled={isSubmitting || !charityId} onClick={handleSubscribe}>
        {isSubmitting ? "Starting checkout…" : "Subscribe now"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
