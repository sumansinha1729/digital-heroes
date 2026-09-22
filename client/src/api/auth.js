import { apiRequest } from "./client.js";

export function signup({ email, password, fullName }) {
  return apiRequest("/auth/signup", { method: "POST", body: { email, password, fullName }, auth: false });
}

export function login({ email, password }) {
  return apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false });
}

export function getMe() {
  return apiRequest("/auth/me");
}
