import { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { useCountUp } from "../../hooks/useCountUp.js";
import { getMyWinners } from "../../api/winners.js";
import { ProofUpload } from "./ProofUpload.jsx";

const TIER_LABEL = { FIVE_MATCH: "5-number match", FOUR_MATCH: "4-number match", THREE_MATCH: "3-number match" };

const VERIFICATION_VARIANT = { PENDING: "neutral", APPROVED: "success", REJECTED: "danger" };
const PAYOUT_VARIANT = { PENDING: "neutral", PAID: "success" };

function verificationLabel(winner) {
  if (winner.proofUrl && winner.verificationStatus === "PENDING") return "Submitted — under review";
  if (winner.verificationStatus === "PENDING") return "Proof needed";
  return winner.verificationStatus;
}

function WinnerRow({ winner, onProofUploaded }) {
  const needsProof = !winner.proofUrl && winner.verificationStatus === "PENDING";

  return (
    <div className="rounded-xl border border-border-light p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-accent-prize">₹{Number(winner.prizeAmount).toLocaleString("en-IN")}</span>
          <span className="ml-2 text-sm text-text-muted">{TIER_LABEL[winner.matchTier]}</span>
        </div>
        <div className="flex gap-2">
          <Badge variant={VERIFICATION_VARIANT[winner.verificationStatus]}>{verificationLabel(winner)}</Badge>
          <Badge variant={PAYOUT_VARIANT[winner.payoutStatus]}>{winner.payoutStatus}</Badge>
        </div>
      </div>

      {winner.verificationStatus === "REJECTED" && winner.rejectionReason && (
        <p className="mt-2 text-sm text-danger">Reason: {winner.rejectionReason}</p>
      )}

      {needsProof && <ProofUpload winnerId={winner.id} onUploaded={onProofUploaded} />}
    </div>
  );
}

export function WinningsModule() {
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWinners = useCallback(async () => {
    const { winners } = await getMyWinners();
    setWinners(winners);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  const totalWon = winners.reduce((sum, w) => sum + Number(w.prizeAmount), 0);
  const displayedTotal = useCountUp(totalWon);

  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">Winnings</h2>
      <div className="mt-3">
        <div className="font-sans text-3xl font-bold text-accent-prize">
          ₹{displayedTotal.toLocaleString("en-IN")}
        </div>
        <p className="text-sm text-text-muted">total won</p>
      </div>

      {isLoading ? (
        <p className="mt-3 text-sm text-text-muted">Loading…</p>
      ) : winners.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border-light p-4 text-sm text-text-muted">
          You haven't won anything yet. Keep logging your scores — every round is an entry.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {winners.map((winner) => (
            <WinnerRow key={winner.id} winner={winner} onProofUploaded={loadWinners} />
          ))}
        </div>
      )}
    </Card>
  );
}
