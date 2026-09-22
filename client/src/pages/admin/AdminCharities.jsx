import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "../../components/layout/AdminShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { TextField } from "../../components/ui/TextField.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { getCharities, getCharity } from "../../api/charities.js";
import { createCharity, updateCharity, deleteCharity } from "../../api/admin.js";
import { ApiError } from "../../api/client.js";
import { EventManager } from "./EventManager.jsx";

const EMPTY_FORM = { name: "", description: "", imageUrl: "", isFeatured: false };

function CharityFormPanel({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState(initial?.events || []);
  const isEditing = Boolean(initial?.id);

  const refreshEvents = useCallback(async () => {
    if (!initial?.id) return;
    const { charity } = await getCharity(initial.id);
    setEvents(charity.events);
  }, [initial?.id]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl || null,
        isFeatured: form.isFeatured,
      };
      if (isEditing) {
        await updateCharity(initial.id, payload);
      } else {
        await createCharity(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 className="font-sans text-lg font-semibold">{isEditing ? "Edit charity" : "Add charity"}</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <TextField
          id="charityName"
          label="Name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="charityDescription" className="text-sm font-medium text-text-primary">
            Description
          </label>
          <textarea
            id="charityDescription"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            required
            rows={3}
            className="rounded-xl border border-border-light px-3 py-2 text-base outline-none focus:ring-2 focus:ring-accent-action/40"
          />
        </div>
        <TextField
          id="charityImageUrl"
          label="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setField("isFeatured", e.target.checked)}
          />
          Featured on homepage
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>

      {isEditing && (
        <EventManager charityId={initial.id} events={events} onEventsChanged={refreshEvents} />
      )}
    </div>
  );
}

export function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | charity object
  const [deleteError, setDeleteError] = useState("");

  const loadCharities = useCallback(async () => {
    setIsLoading(true);
    const { charities } = await getCharities();
    setCharities(charities);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCharities();
  }, [loadCharities]);

  async function handleDelete(charity) {
    if (!confirm(`Delete "${charity.name}"? This cannot be undone.`)) return;
    setDeleteError("");
    try {
      await deleteCharity(charity.id);
      await loadCharities();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete charity");
    }
  }

  function handleSaved() {
    setModal(null);
    loadCharities();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-semibold">Charities</h1>
        <Button variant="primary" onClick={() => setModal("new")}>
          Add charity
        </Button>
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <CharityFormPanel
            initial={modal === "new" ? null : modal}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        </Modal>
      )}

      {deleteError && <p className="mt-4 text-sm text-danger">{deleteError}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border-light bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Featured</th>
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
            ) : (
              charities.map((charity) => (
                <tr key={charity.id} className="border-b border-border-light last:border-0">
                  <td className="px-4 py-3 font-medium">{charity.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-text-muted">{charity.description}</td>
                  <td className="px-4 py-3">
                    {charity.isFeatured && <Badge variant="charity">Featured</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setModal(charity)}
                        className="text-accent-action hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(charity)}
                        className="text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
