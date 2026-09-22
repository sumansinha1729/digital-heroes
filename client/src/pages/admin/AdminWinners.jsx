import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "../../components/layout/AdminShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { getAdminWinners, verifyWinner, markWinnerPaid } from "../../api/admin.js";
import { ApiError } from "../../api/client.js";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const TIER_LABEL = { FIVE_MATCH: "5-match", FOUR_MATCH: "4-match", THREE_MATCH: "3-match" };
const PAYOUT_VARIANT = { PENDING: "neutral", PAID: "success" };

function formatMonth(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function RejectDialog({ winner, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      setError("A reason is required");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await verifyWinner(winner.id, "REJECTED", reason);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject winner");
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-sans text-lg font-semibold">Reject this win?</h2>
      <p className="mt-2 text-sm text-text-muted">
        {winner.user.fullName} — {TIER_LABEL[winner.matchTier]} — ₹{Number(winner.prizeAmount).toLocaleString("en-IN")}
      </p>
      <label htmlFor="rejectReason" className="mt-4 block text-sm font-medium text-text-primary">
        Reason (shown to the user)
      </label>
      <textarea
        id="rejectReason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className="mt-2 w-full rounded-xl border border-border-light px-3 py-2 text-base outline-none focus:ring-2 focus:ring-accent-action/40"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button variant="primary" className="bg-danger hover:bg-danger" disabled={isSaving} onClick={handleConfirm}>
          {isSaving ? "Rejecting…" : "Reject"}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ImageLightbox({ url, onClose }) {
  return (
    <Modal onClose={onClose}>
      <img src={url} alt="Proof" className="max-h-[80vh] w-full rounded-lg object-contain" />
    </Modal>
  );
}

export function AdminWinners() {
  const [tab, setTab] = useState("PENDING");
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadWinners = useCallback(async () => {
    setIsLoading(true);
    const { winners } = await getAdminWinners(tab);
    setWinners(winners);
    setIsLoading(false);
  }, [tab]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  async function handleApprove(winner) {
    setActionError("");
    try {
      await verifyWinner(winner.id, "APPROVED");
      loadWinners();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not approve winner");
    }
  }

  async function handleMarkPaid(winner) {
    setActionError("");
    try {
      await markWinnerPaid(winner.id);
      loadWinners();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not mark as paid");
    }
  }

  function handleRejected() {
    setRejectTarget(null);
    loadWinners();
  }

  return (
    <AdminShell>
      <h1 className="font-sans text-2xl font-semibold">Winners</h1>

      <div className="mt-4 flex gap-1 border-b border-border-light">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-b-2 border-accent-action text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && <p className="mt-4 text-sm text-danger">{actionError}</p>}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Draw</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Proof</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-muted">
                  No winners in this category.
                </td>
              </tr>
            ) : (
              winners.map((winner) => (
                <tr key={winner.id} className="border-b border-border-light last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{winner.user.fullName}</div>
                    <div className="text-xs text-text-muted">{winner.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatMonth(winner.draw.drawMonth)}</td>
                  <td className="px-4 py-3">{TIER_LABEL[winner.matchTier]}</td>
                  <td className="px-4 py-3 font-medium text-accent-prize">
                    ₹{Number(winner.prizeAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    {winner.proofUrl ? (
                      <button onClick={() => setLightboxUrl(winner.proofUrl)}>
                        <img
                          src={winner.proofUrl}
                          alt="Proof thumbnail"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      </button>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PAYOUT_VARIANT[winner.payoutStatus]}>{winner.payoutStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      {winner.verificationStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(winner)}
                            className="text-accent-charity hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectTarget(winner)}
                            className="text-danger hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {winner.verificationStatus === "APPROVED" && winner.payoutStatus === "PENDING" && (
                        <button
                          onClick={() => handleMarkPaid(winner)}
                          className="text-accent-action hover:underline"
                        >
                          Mark as paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rejectTarget && (
        <Modal onClose={() => setRejectTarget(null)}>
          <RejectDialog winner={rejectTarget} onClose={() => setRejectTarget(null)} onDone={handleRejected} />
        </Modal>
      )}

      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </AdminShell>
  );
}
