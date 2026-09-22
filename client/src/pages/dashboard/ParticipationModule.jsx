import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { getMyUpcomingEntry } from "../../api/draws.js";

export function ParticipationModule() {
  const [draw, setDraw] = useState(null);
  const [entry, setEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyUpcomingEntry()
      .then((result) => {
        setDraw(result.draw);
        setEntry(result.entry);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">This month's entry</h2>

      {isLoading ? (
        <p className="mt-3 text-sm text-text-muted">Loading…</p>
      ) : entry ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.numbers.map((number) => (
              <span
                key={number}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-prize font-sans text-sm font-bold text-accent-prize"
              >
                {number}
              </span>
            ))}
          </div>
          {draw && (
            <p className="mt-3 text-sm text-text-muted">
              Draw for{" "}
              {new Date(draw.drawMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-border-light p-4 text-sm text-text-muted">
          No draw entries yet — scores you log this month enter you into the draw automatically.
        </p>
      )}
    </Card>
  );
}
