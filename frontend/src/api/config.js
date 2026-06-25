import Constants from 'expo-constants';

// Cambiar la IP en app.json > extra > apiBaseUrl para apuntar al host Docker
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.1.100:3000';

let _token = null;
let _role = null;

export function setToken(token) {
  _token = token;
  if (!token) _role = null;
}

export function setRole(role) {
  _role = role;
}

export function getRole() {
  return _role;
}

export function getToken() {
  return _token;
}

export function getAuthHeader() {
  return _token ? { Authorization: `Bearer ${_token}` } : {};
}
