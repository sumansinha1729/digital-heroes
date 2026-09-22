import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { getCharities } from "../../api/charities.js";
import { changeCharity } from "../../api/subscriptions.js";
import { ApiError } from "../../api/client.js";

export function CharityModule({ subscription, onSubscriptionChanged }) {
  const [isChanging, setIsChanging] = useState(false);
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState(subscription.charityId);
  const [percentage, setPercentage] = useState(Number(subscription.charityPercentage));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isChanging && charities.length === 0) {
      getCharities().then(({ charities }) => setCharities(charities));
    }
  }, [isChanging, charities.length]);

  async function handleSave() {
    setError("");
    setIsSaving(true);
    try {
      await changeCharity({ charityId: selectedCharityId, charityPercentage: percentage });
      await onSubscriptionChanged();
      setIsChanging(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update");
    } finally {
      setIsSaving(false);
    }
  }

  if (isChanging) {
    return (
      <Card>
        <h2 className="font-sans text-lg font-semibold">Change charity</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {charities.map((charity) => (
            <button
              key={charity.id}
              onClick={() => setSelectedCharityId(charity.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                selectedCharityId === charity.id
                  ? "border-accent-charity bg-accent-charity/10"
                  : "border-border-light"
              }`}
            >
              <div className="font-semibold">{charity.name}</div>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="charityPct" className="text-sm font-medium">
            Contribution: {percentage}%
          </label>
          <input
            id="charityPct"
            type="range"
            min={10}
            max={100}
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="mt-2 w-full accent-accent-charity"
          />
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="primary" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => setIsChanging(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">Your charity</h2>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="font-semibold text-accent-charity">{subscription.charity.name}</div>
          <div className="text-sm text-text-muted">
            {Number(subscription.charityPercentage)}% of your subscription
          </div>
        </div>
        <button onClick={() => setIsChanging(true)} className="text-sm text-accent-action hover:underline">
          Change
        </button>
      </div>
    </Card>
  );
}
