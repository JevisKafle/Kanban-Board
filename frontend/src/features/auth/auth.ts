import { apiFetch } from "#/lib/api-client";
import { type User } from "#/lib/user-types";

export function fetchMe() {
  return apiFetch<User>("/auth/me/");
}

export function fetchCsrf() {
  return apiFetch<{ detail: string }>("/auth/csrf/");
}

export function registerRequest(
  username: string,
  email: string,
  password: string,
) {
  return apiFetch<User>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function loginRequest(username: string, password: string) {
  return apiFetch<User>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutRequest() {
  return apiFetch<void>("/auth/logout/", { method: "POST" });
}
