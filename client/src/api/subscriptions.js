import { apiRequest } from "./client.js";

export function createSubscription({ plan, charityId, charityPercentage }) {
  return apiRequest("/subscriptions", { method: "POST", body: { plan, charityId, charityPercentage } });
}

export function getMySubscription() {
  return apiRequest("/subscriptions/me");
}

export function cancelSubscription() {
  return apiRequest("/subscriptions/cancel", { method: "POST" });
}

export function changeCharity({ charityId, charityPercentage }) {
  return apiRequest("/subscriptions/charity", { method: "PUT", body: { charityId, charityPercentage } });
}
