import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { getCharities } from "../api/charities.js";

function CharityCard({ charity, featured }) {
  return (
    <Link to={`/charities/${charity.id}`} className={featured ? "sm:col-span-2 lg:col-span-3" : ""}>
      <Card className="flex h-full flex-col">
        <div
          className={`w-full overflow-hidden rounded-xl bg-accent-charity/10 ${featured ? "aspect-21/9" : "aspect-video"}`}
          aria-hidden="true"
        >
          {charity.imageUrl && (
            <img src={charity.imageUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <h3 className={`mt-3 font-serif ${featured ? "text-2xl" : "text-lg"}`}>{charity.name}</h3>
        <p className="mt-1 text-sm text-text-muted line-clamp-2">{charity.description}</p>
      </Card>
    </Link>
  );
}

export function CharityDirectory() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCharities = useCallback((searchTerm) => {
    setIsLoading(true);
    getCharities(searchTerm)
      .then(({ charities }) => setCharities(charities))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => loadCharities(search), 300);
    return () => clearTimeout(timeoutId);
  }, [search, loadCharities]);

  const featuredCharity = charities.find((c) => c.isFeatured);
  const otherCharities = charities.filter((c) => !c.isFeatured);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl">Choose your cause</h1>

        <input
          type="search"
          placeholder="Search charities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-6 w-full max-w-md rounded-xl border border-border-light px-4 py-2 outline-none focus:ring-2 focus:ring-accent-action/40"
        />

        {isLoading ? (
          <p className="mt-8 text-text-muted">Loading charities…</p>
        ) : charities.length === 0 ? (
          <p className="mt-8 text-text-muted">No charities match "{search}".</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCharity && <CharityCard charity={featuredCharity} featured />}
            {otherCharities.map((charity) => (
              <CharityCard key={charity.id} charity={charity} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
