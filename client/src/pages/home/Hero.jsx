import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg px-4 py-8 text-text-primary-dark md:px-8 md:py-16 min-h-[90vh] flex items-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-charity/20 blur-3xl animate-pulse"
        style={{ animationDuration: "6s" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-accent-prize/10 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      <div className="relative mx-auto max-w-3xl text-center animate-[fadeRise_0.6s_ease-out]">
        <h1 className="font-serif text-4xl leading-tight md:text-6xl">
          Play your game. Back your cause. Win together.
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base text-text-primary-dark/80 md:text-lg">
          Subscribe, track your Stableford scores, enter the monthly prize draw, and send part of
          every fee straight to a charity you choose.
        </p>
        <div className="mt-8">
          <Link to="/signup">
            <Button variant="primary" className="px-6 py-3 text-base">
              Subscribe now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
