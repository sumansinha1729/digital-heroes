import { useState } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { TextField } from "../../components/ui/TextField.jsx";
import { createScore, updateScore, deleteScore } from "../../api/scores.js";
import { ApiError } from "../../api/client.js";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ScoreRow({ score, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [scoreValue, setScoreValue] = useState(score.scoreValue);
  const [scoreDate, setScoreDate] = useState(score.scoreDate.slice(0, 10));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError("");
    setIsSaving(true);
    try {
      await onEdit(score.id, { scoreValue: Number(scoreValue), scoreDate });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border-light p-3 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="number"
          min={1}
          max={45}
          value={scoreValue}
          onChange={(e) => setScoreValue(e.target.value)}
          className="w-20 rounded-lg border border-border-light px-2 py-1"
        />
        <input
          type="date"
          value={scoreDate}
          onChange={(e) => setScoreDate(e.target.value)}
          className="rounded-lg border border-border-light px-2 py-1"
        />
        <div className="flex gap-2">
          <Button variant="primary" disabled={isSaving} onClick={handleSave} className="px-3 py-1.5 text-sm">
            Save
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm">
            Cancel
          </Button>
        </div>
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border-light p-3">
      <div>
        <span className="font-sans text-lg font-semibold">{score.scoreValue}</span>
        <span className="ml-3 text-sm text-text-muted">{formatDate(score.scoreDate)}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-sm text-accent-action hover:underline">
          Edit
        </button>
        <button onClick={() => onDelete(score.id)} className="text-sm text-danger hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
}

export function ScoreModule({ scores, onScoresChanged }) {
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await createScore({ scoreValue: Number(newValue), scoreDate: newDate });
      setNewValue("");
      setNewDate("");
      await onScoresChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add score");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(id, data) {
    await updateScore(id, data);
    await onScoresChanged();
  }

  async function handleDelete(id) {
    await deleteScore(id);
    await onScoresChanged();
  }

  return (
    <Card>
      <h2 className="font-sans text-lg font-semibold">Your scores</h2>
      <p className="text-sm text-text-muted">Your last 5 rounds, most recent first.</p>

      <div className="mt-4 flex flex-col gap-2">
        {scores.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-light p-4 text-sm text-text-muted">
            No scores yet — add your first round below.
          </p>
        )}
        {scores.map((score) => (
          <ScoreRow key={score.id} score={score} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-2 border-t border-border-light pt-4 sm:flex-row sm:items-end">
        <TextField
          id="newScoreValue"
          label="Score (1–45)"
          type="number"
          min={1}
          max={45}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          required
          className="sm:w-32"
        />
        <TextField
          id="newScoreDate"
          label="Date"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          required
          className="sm:w-40"
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add score"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
