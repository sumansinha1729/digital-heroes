import { useState } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { TextField } from "../../components/ui/TextField.jsx";
import { createEvent, updateEvent, deleteEvent } from "../../api/admin.js";
import { ApiError } from "../../api/client.js";

const EMPTY_EVENT = { title: "", description: "", eventDate: "" };

function EventForm({ charityId, initial, onCancel, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? { title: initial.title, description: initial.description, eventDate: initial.eventDate.slice(0, 10) }
      : EMPTY_EVENT
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(initial?.id);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateEvent(initial.id, form);
      } else {
        await createEvent(charityId, form);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save event");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border-light p-3">
      <TextField
        id="eventTitle"
        label="Title"
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
        required
      />
      <TextField
        id="eventDate"
        label="Date"
        type="date"
        value={form.eventDate}
        onChange={(e) => setField("eventDate", e.target.value)}
        required
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="eventDescription" className="text-sm font-medium text-text-primary">
          Description
        </label>
        <textarea
          id="eventDescription"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          required
          rows={2}
          className="rounded-xl border border-border-light px-3 py-2 text-base outline-none focus:ring-2 focus:ring-accent-action/40"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isSaving} className="px-3 py-1.5 text-sm">
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="px-3 py-1.5 text-sm">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function EventManager({ charityId, events, onEventsChanged }) {
  const [editingId, setEditingId] = useState(null); // null | "new" | event id

  async function handleDelete(eventId) {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(eventId);
    onEventsChanged();
  }

  function handleSaved() {
    setEditingId(null);
    onEventsChanged();
  }

  const editingEvent = events.find((e) => e.id === editingId);

  return (
    <div className="mt-6 border-t border-border-light pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-text-muted">
          Events
        </h3>
        {editingId === null && (
          <button
            onClick={() => setEditingId("new")}
            className="text-sm text-accent-action hover:underline"
          >
            Add event
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {events.length === 0 && editingId !== "new" && (
          <p className="text-sm text-text-muted">No events yet.</p>
        )}

        {events.map((event) =>
          editingId === event.id ? (
            <EventForm
              key={event.id}
              charityId={charityId}
              initial={event}
              onCancel={() => setEditingId(null)}
              onSaved={handleSaved}
            />
          ) : (
            <div key={event.id} className="flex items-center justify-between rounded-xl border border-border-light p-3">
              <div>
                <div className="text-sm font-medium">{event.title}</div>
                <div className="text-xs text-text-muted">
                  {new Date(event.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => setEditingId(event.id)} className="text-accent-action hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(event.id)} className="text-danger hover:underline">
                  Delete
                </button>
              </div>
            </div>
          )
        )}

        {editingId === "new" && (
          <EventForm charityId={charityId} onCancel={() => setEditingId(null)} onSaved={handleSaved} />
        )}
      </div>
    </div>
  );
}
