import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";

export function FinalCta() {
  return (
    <section className="bg-bg px-4 py-8 text-center text-text-primary-dark md:px-8 md:py-16">
      <h2 className="font-serif text-3xl md:text-4xl">Ready to play, win, and give back?</h2>
      <p className="mx-auto mt-3 max-w-md text-base text-text-primary-dark/80">
        Your subscription funds the prize pool and your chosen charity — every single month.
      </p>
      <Link to="/signup" className="mt-6 inline-block">
        <Button variant="primary" className="px-6 py-3 text-base">
          Subscribe now
        </Button>
      </Link>
    </section>
  );
}
