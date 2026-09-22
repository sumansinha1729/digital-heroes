import { apiRequest } from "./client.js";

export function createDonation({ charityId, amount }) {
  return apiRequest("/donations", { method: "POST", body: { charityId, amount } });
}
