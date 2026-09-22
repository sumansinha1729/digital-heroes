import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "../../components/layout/AdminShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { TextField } from "../../components/ui/TextField.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { getAdminDraws, getAdminDraw, createDraw, simulateDraw, publishDraw } from "../../api/admin.js";
import { ApiError } from "../../api/client.js";

const STATUS_VARIANT = { DRAFT: "neutral", SIMULATED: "prize", PUBLISHED: "success" };

const TIER_LABEL = { FIVE_MATCH: "5-number match", FOUR_MATCH: "4-number match", THREE_MATCH: "3-number match" };

function formatMonth(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CreateDrawForm({ onClose, onCreated }) {
  const [drawMonth, setDrawMonth] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const monthStart = new Date(`${drawMonth}-01T00:00:00Z`);
      const periodEnd = new Date(monthStart);
      periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

      await createDraw({
        drawMonth: monthStart.toISOString(),
        periodStart: monthStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        logicType: "RANDOM",
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-sans text-lg font-semibold">Create draw</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <TextField
          id="drawMonth"
          label="Month"
          type="month"
          value={drawMonth}
          onChange={(e) => setDrawMonth(e.target.value)}
          required
        />

        <div>
          <span className="text-sm font-medium text-text-primary">Draw logic</span>
          <div className="mt-2 flex gap-3">
            <span className="rounded-xl border border-accent-action bg-accent-action/10 px-4 py-2 text-sm font-medium">
              Random
            </span>
            <span className="cursor-not-allowed rounded-xl border border-border-light px-4 py-2 text-sm text-text-muted">
              Algorithmic — coming soon
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Creating…" : "Create draw"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function PublishConfirmation({ draw, onClose, onPublished }) {
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  async function handleConfirm() {
    setError("");
    setIsPublishing(true);
    try {
      await publishDraw(draw.id);
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not publish draw");
      setIsPublishing(false);
    }
  }

  return (
    <div>
      <h2 className="font-sans text-lg font-semibold text-danger">Publish this draw?</h2>
      <p className="mt-3 text-sm text-text-primary">
        This will lock in the winning numbers for <strong>{formatMonth(draw.drawMonth)}</strong>,
        create real winner records for every matching entry, and cannot be undone.
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="primary" className="bg-danger hover:bg-danger" disabled={isPublishing} onClick={handleConfirm}>
          {isPublishing ? "Publishing…" : "Yes, publish"}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function DrawDetail({ drawId, onClose, onChanged }) {
  const [draw, setDraw] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const load = useCallback(async () => {
    const { draw } = await getAdminDraw(drawId);
    setDraw(draw);
  }, [drawId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSimulate() {
    setError("");
    setIsSimulating(true);
    try {
      const result = await simulateDraw(drawId);
      setDraw(result.draw);
      setPreview(result.preview);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not simulate draw");
    } finally {
      setIsSimulating(false);
    }
  }

  function handlePublished() {
    setShowPublishConfirm(false);
    onChanged();
  }

  if (!draw) return <p className="text-sm text-text-muted">Loading…</p>;

  if (showPublishConfirm) {
    return (
      <PublishConfirmation
        draw={draw}
        onClose={() => setShowPublishConfirm(false)}
        onPublished={handlePublished}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-lg font-semibold">{formatMonth(draw.drawMonth)}</h2>
        <Badge variant={STATUS_VARIANT[draw.status]}>{draw.status}</Badge>
      </div>

      {draw.status === "PUBLISHED" ? (
        <p className="mt-3 text-sm text-text-muted">
          Published {new Date(draw.publishedAt).toLocaleDateString("en-IN")}. Winning numbers:{" "}
          <span className="font-semibold text-accent-prize">{draw.winningNumbers.join(", ")}</span>
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-text-muted">
            Run a simulation to generate winning numbers and preview the payout before publishing.
          </p>

          <Button variant="primary" disabled={isSimulating} onClick={handleSimulate} className="mt-3">
            {isSimulating ? "Simulating…" : "Run simulation"}
          </Button>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}

          {(preview || draw.status === "SIMULATED") && draw.winningNumbers?.length > 0 && (
            <div className="mt-4 rounded-xl border border-accent-prize/30 bg-accent-prize/5 p-4">
              <p className="text-sm font-medium text-accent-prize">
                Winning numbers: {draw.winningNumbers.join(", ")}
              </p>

              {preview && (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-text-muted">
                    <tr>
                      <th className="py-1 font-medium">Tier</th>
                      <th className="py-1 font-medium">Winners</th>
                      <th className="py-1 font-medium">Pool</th>
                      <th className="py-1 font-medium">Per winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row) => (
                      <tr key={row.tier} className="border-t border-accent-prize/20">
                        <td className="py-1.5">{TIER_LABEL[row.tier]}</td>
                        <td className="py-1.5">{row.winnerCount}</td>
                        <td className="py-1.5">{formatCurrency(row.poolAmount)}</td>
                        <td className="py-1.5">{formatCurrency(row.prizePerWinner)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {draw.status === "SIMULATED" && (
                <Button variant="primary" className="mt-4" onClick={() => setShowPublishConfirm(true)}>
                  Publish
                </Button>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-4">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | drawId

  const loadDraws = useCallback(async () => {
    setIsLoading(true);
    const { draws } = await getAdminDraws();
    setDraws(draws);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDraws();
  }, [loadDraws]);

  function handleCreated() {
    setModal(null);
    loadDraws();
  }

  function handleChanged() {
    setModal(null);
    loadDraws();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-semibold">Draws</h1>
        <Button variant="primary" onClick={() => setModal("new")}>
          Create draw
        </Button>
      </div>

      {modal === "new" && (
        <Modal onClose={() => setModal(null)}>
          <CreateDrawForm onClose={() => setModal(null)} onCreated={handleCreated} />
        </Modal>
      )}

      {modal && modal !== "new" && (
        <Modal onClose={() => setModal(null)}>
          <DrawDetail drawId={modal} onClose={() => setModal(null)} onChanged={handleChanged} />
        </Modal>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border-light bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Month</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Logic</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : draws.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                  No draws yet.
                </td>
              </tr>
            ) : (
              draws.map((draw) => (
                <tr key={draw.id} className="border-b border-border-light last:border-0">
                  <td className="px-4 py-3 font-medium">{formatMonth(draw.drawMonth)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[draw.status]}>{draw.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{draw.logicType}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setModal(draw.id)} className="text-accent-action hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
