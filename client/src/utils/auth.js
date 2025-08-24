// src/utils/auth.js

// Save token (localStorage if remember, else sessionStorage)
export function saveToken(token, remember = true) {
  try {
    if (remember) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {}
}

export function isLoggedIn() {
  return getToken() !== null;
}
