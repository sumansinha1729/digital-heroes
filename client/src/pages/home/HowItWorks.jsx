import { Card } from "../../components/ui/Card.jsx";

const STEPS = [
  {
    title: "Subscribe",
    description: "Pick a monthly or yearly plan and choose the charity your fee supports.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="20" height="20" rx="6" className="stroke-accent-action" strokeWidth="2" />
        <rect x="16" y="16" width="18" height="18" rx="6" className="stroke-accent-action" strokeWidth="2" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: "Track your scores",
    description: "Log your last five Stableford rounds and watch your recent form take shape.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" aria-hidden="true">
        <path d="M6 30L14 18L22 24L34 8" className="stroke-accent-action" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Win & give back",
    description: "Every round enters you in the monthly draw — prizes and charity impact, together.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" aria-hidden="true">
        <circle cx="15" cy="20" r="9" className="stroke-accent-charity" strokeWidth="2" />
        <circle cx="25" cy="20" r="9" className="stroke-accent-prize" strokeWidth="2" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface px-4 py-8 md:px-8 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-sans text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="text-left">
              {step.icon}
              <h3 className="mt-3 font-sans text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-base text-text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
