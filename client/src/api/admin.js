import { apiRequest } from "./client.js";

export function createCharity(data) {
  return apiRequest("/admin/charities", { method: "POST", body: data });
}

export function updateCharity(id, data) {
  return apiRequest(`/admin/charities/${id}`, { method: "PUT", body: data });
}

export function deleteCharity(id) {
  return apiRequest(`/admin/charities/${id}`, { method: "DELETE" });
}

export function createEvent(charityId, data) {
  return apiRequest(`/admin/charities/${charityId}/events`, { method: "POST", body: data });
}

export function updateEvent(id, data) {
  return apiRequest(`/admin/events/${id}`, { method: "PUT", body: data });
}

export function deleteEvent(id) {
  return apiRequest(`/admin/events/${id}`, { method: "DELETE" });
}

export function getAdminDraws() {
  return apiRequest("/admin/draws");
}

export function getAdminDraw(id) {
  return apiRequest(`/admin/draws/${id}`);
}

export function createDraw(data) {
  return apiRequest("/admin/draws", { method: "POST", body: data });
}

export function simulateDraw(id) {
  return apiRequest(`/admin/draws/${id}/simulate`, { method: "POST" });
}

export function publishDraw(id) {
  return apiRequest(`/admin/draws/${id}/publish`, { method: "POST" });
}
