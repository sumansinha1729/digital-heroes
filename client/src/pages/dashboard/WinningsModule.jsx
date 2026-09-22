import { Card } from "../../components/ui/Card.jsx";

export function WinningsModule() {
  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">Winnings</h2>
      <div className="mt-3">
        <div className="font-sans text-3xl font-bold text-accent-prize">₹0</div>
        <p className="text-sm text-text-muted">total won</p>
      </div>
      <p className="mt-3 rounded-xl border border-dashed border-border-light p-4 text-sm text-text-muted">
        You haven't won anything yet. Keep logging your scores — every round is an entry.
      </p>
    </Card>
  );
}
