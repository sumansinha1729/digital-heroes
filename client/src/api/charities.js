import { apiRequest } from "./client.js";

export function getCharities() {
  return apiRequest("/charities", { auth: false });
}
