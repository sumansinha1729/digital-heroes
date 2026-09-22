import { apiRequest } from "./client.js";

export function getDraws() {
  return apiRequest("/draws", { auth: false });
}

export function getDraw(id) {
  return apiRequest(`/draws/${id}`, { auth: false });
}

export function getMyUpcomingEntry() {
  return apiRequest("/draws/me/upcoming");
}
