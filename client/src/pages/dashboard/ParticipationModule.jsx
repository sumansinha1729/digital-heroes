import { Card } from "../../components/ui/Card.jsx";

export function ParticipationModule() {
  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">This month's entry</h2>
      <p className="mt-3 rounded-xl border border-dashed border-border-light p-4 text-sm text-text-muted">
        No draw entries yet — scores you log this month enter you into the draw automatically.
      </p>
    </Card>
  );
}
