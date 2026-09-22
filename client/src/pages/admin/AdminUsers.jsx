import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "../../components/layout/AdminShell.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { TextField } from "../../components/ui/TextField.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUser,
  updateAdminUserSubscription,
  updateAdminScore,
} from "../../api/admin.js";
import { ApiError } from "../../api/client.js";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ScoreEditRow({ score, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [scoreValue, setScoreValue] = useState(score.scoreValue);
  const [scoreDate, setScoreDate] = useState(score.scoreDate.slice(0, 10));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError("");
    setIsSaving(true);
    try {
      await updateAdminScore(score.id, { scoreValue: Number(scoreValue), scoreDate });
      setIsEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border-light p-2 sm:flex-row sm:items-center">
        <input
          type="number"
          min={1}
          max={45}
          value={scoreValue}
          onChange={(e) => setScoreValue(e.target.value)}
          className="w-20 rounded-lg border border-border-light px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={scoreDate}
          onChange={(e) => setScoreDate(e.target.value)}
          className="rounded-lg border border-border-light px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={isSaving} className="text-sm text-accent-action hover:underline">
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setIsEditing(false)} className="text-sm text-text-muted hover:underline">
            Cancel
          </button>
        </div>
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-light p-2 text-sm">
      <span>
        <strong>{score.scoreValue}</strong> — {formatDate(score.scoreDate)}
      </span>
      <button onClick={() => setIsEditing(true)} className="text-accent-action hover:underline">
        Edit
      </button>
    </div>
  );
}

function UserDetailPanel({ userId, onUserChanged }) {
  const [detail, setDetail] = useState(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [subStatus, setSubStatus] = useState("");
  const [subError, setSubError] = useState("");
  const [isSavingSub, setIsSavingSub] = useState(false);

  const load = useCallback(async () => {
    const { user } = await getAdminUserDetail(userId);
    setDetail(user);
    setFullName(user.fullName);
    setRole(user.role);
    setSubStatus(user.subscriptions[0]?.status || "");
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveProfile() {
    setProfileError("");
    setIsSavingProfile(true);
    try {
      await updateAdminUser(userId, { fullName, role });
      await load();
      onUserChanged();
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveSubscription() {
    setSubError("");
    setIsSavingSub(true);
    try {
      await updateAdminUserSubscription(userId, { status: subStatus });
      await load();
    } catch (err) {
      setSubError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setIsSavingSub(false);
    }
  }

  if (!detail) return <p className="p-4 text-sm text-text-muted">Loading…</p>;

  const subscription = detail.subscriptions[0];

  return (
    <div className="grid grid-cols-1 gap-6 bg-surface p-4 md:grid-cols-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Profile</h3>
        <div className="mt-2 flex flex-col gap-2">
          <TextField id={`fullName-${userId}`} label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div>
            <label className="text-sm font-medium text-text-primary">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border-light px-3 py-2 text-base"
            >
              <option value="SUBSCRIBER">SUBSCRIBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {profileError && <p className="text-sm text-danger">{profileError}</p>}
          <Button variant="primary" disabled={isSavingProfile} onClick={handleSaveProfile} className="px-3 py-1.5 text-sm">
            {isSavingProfile ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Subscription</h3>
        {subscription ? (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm text-text-muted">
              {subscription.plan} — {subscription.charity.name} ({Number(subscription.charityPercentage)}%)
            </p>
            <div>
              <label className="text-sm font-medium text-text-primary">Status</label>
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-light px-3 py-2 text-base"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="LAPSED">LAPSED</option>
              </select>
            </div>
            {subError && <p className="text-sm text-danger">{subError}</p>}
            <Button variant="primary" disabled={isSavingSub} onClick={handleSaveSubscription} className="px-3 py-1.5 text-sm">
              {isSavingSub ? "Saving…" : "Save subscription"}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-muted">No active subscription.</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Recent scores</h3>
        <div className="mt-2 flex flex-col gap-2">
          {detail.scores.length === 0 ? (
            <p className="text-sm text-text-muted">No scores yet.</p>
          ) : (
            detail.scores.map((score) => <ScoreEditRow key={score.id} score={score} onSaved={load} />)
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadUsers = useCallback((searchTerm) => {
    setIsLoading(true);
    getAdminUsers(searchTerm)
      .then(({ users }) => setUsers(users))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(timeoutId);
  }, [search, loadUsers]);

  return (
    <AdminShell>
      <h1 className="font-sans text-2xl font-semibold">Users</h1>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full max-w-md rounded-xl border border-border-light px-4 py-2 outline-none focus:ring-2 focus:ring-accent-action/40"
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    className="cursor-pointer border-b border-border-light hover:bg-surface last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3 text-text-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "ADMIN" ? "prize" : "neutral"}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(user.createdAt)}</td>
                  </tr>
                  {expandedId === user.id && (
                    <tr key={`${user.id}-detail`}>
                      <td colSpan={4} className="p-0">
                        <UserDetailPanel userId={user.id} onUserChanged={() => loadUsers(search)} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
