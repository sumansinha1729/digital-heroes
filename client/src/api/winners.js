import { apiRequest, getToken } from "./client.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

export function getMyWinners() {
  return apiRequest("/winners/me");
}

export async function submitProof(winnerId, file) {
  const formData = new FormData();
  formData.append("proof", file);

  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/winners/${winnerId}/proof`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Upload failed");
  }
  return data;
}
