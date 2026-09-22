import { Link } from "react-router-dom";
import { useCountUp } from "../../hooks/useCountUp.js";
import { Button } from "../../components/ui/Button.jsx";

// Placeholder until Step 8 wires this to a real featured charity + live totals.
const PLACEHOLDER_CHARITY = {
  name: "Greenfield Youth Trust",
  mission: "Funding free coaching and equipment for young golfers from low-income families.",
  totalRaisedThisMonth: 48500,
};

export function CharitySpotlight() {
  const displayedTotal = useCountUp(PLACEHOLDER_CHARITY.totalRaisedThisMonth);

  return (
    <section className="bg-surface px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
        <div className="order-2 md:order-1">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent-charity">
            Charity spotlight
          </span>
          <h2 className="mt-2 font-serif text-3xl">{PLACEHOLDER_CHARITY.name}</h2>
          <p className="mt-3 text-base text-text-muted">{PLACEHOLDER_CHARITY.mission}</p>

          <div className="mt-6">
            <div className="font-sans text-4xl font-bold text-accent-charity">
              ₹{displayedTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-sm text-text-muted">raised this month</p>
          </div>

          <Link to="/charities" className="mt-6 inline-block">
            <Button variant="charity">Browse charities</Button>
          </Link>
        </div>

        <div className="order-1 aspect-[4/3] w-full rounded-2xl bg-accent-charity/10 md:order-2" aria-hidden="true" />
      </div>
    </section>
  );
}
