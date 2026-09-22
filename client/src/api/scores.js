import { apiRequest } from "./client.js";

export function getScores() {
  return apiRequest("/scores");
}

export function createScore({ scoreValue, scoreDate }) {
  return apiRequest("/scores", { method: "POST", body: { scoreValue, scoreDate } });
}

export function updateScore(id, { scoreValue, scoreDate }) {
  return apiRequest(`/scores/${id}`, { method: "PUT", body: { scoreValue, scoreDate } });
}

export function deleteScore(id) {
  return apiRequest(`/scores/${id}`, { method: "DELETE" });
}
