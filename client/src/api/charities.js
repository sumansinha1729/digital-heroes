import { apiRequest } from "./client.js";

export function getCharities(search) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/charities${query}`, { auth: false });
}

export function getFeaturedCharity() {
  return apiRequest("/charities/featured", { auth: false });
}

export function getCharity(id) {
  return apiRequest(`/charities/${id}`, { auth: false });
}

export function getCharityStats(id) {
  return apiRequest(`/charities/${id}/stats`, { auth: false });
}
