export function saveToken(token) {
  localStorage.setItem("token", token);
}
export const setToken = saveToken;

export function getToken() {
  return localStorage.getItem("token");
}
export function clearToken() {
  localStorage.removeItem("token");
}
export function isLoggedIn() {
  return !!getToken();
}
