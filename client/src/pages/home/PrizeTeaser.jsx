import { useCountUp } from "../../hooks/useCountUp.js";

// Placeholder until Step 8 wires this to real draw/payout totals.
const LAST_MONTH_GIVEN_AWAY = 62400;

export function PrizeTeaser() {
  const displayedTotal = useCountUp(LAST_MONTH_GIVEN_AWAY);

  return (
    <section className="bg-surface px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-accent-prize">
          Monthly draw
        </span>
        <p className="mx-auto mt-2 max-w-xl text-base text-text-muted">
          Every logged round is an entry. Match numbers with the monthly draw and win a share of
          the prize pool.
        </p>
        <div className="mt-4 font-sans text-3xl font-bold text-accent-prize">
          ₹{displayedTotal.toLocaleString("en-IN")}
        </div>
        <p className="text-sm text-text-muted">given away last month</p>
        <a href="#" className="mt-4 inline-block text-sm font-medium text-accent-prize hover:underline">
          How draws work →
        </a>
      </div>
    </section>
  );
}
