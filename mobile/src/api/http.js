import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const ACCESS_KEY = 'hotel_access_token';
const REFRESH_KEY = 'hotel_refresh_token';

export const tokenStore = {
  async getAccess() { return AsyncStorage.getItem(ACCESS_KEY); },
  async getRefresh() { return AsyncStorage.getItem(REFRESH_KEY); },
  async save(access, refresh) {
    await AsyncStorage.multiSet([[ACCESS_KEY, access], [REFRESH_KEY, refresh]]);
  },
  async saveAccess(access) { await AsyncStorage.setItem(ACCESS_KEY, access); },
  async clear() { await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]); },
};

async function requestRaw(path, options = {}) {
  if (!API_URL) throw new Error('Falta EXPO_PUBLIC_API_URL en mobile/.env');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 12000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { response, data };
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('La conexión tardó demasiado. Verifica que Django esté activo.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshAccessToken() {
  const refresh = await tokenStore.getRefresh();
  if (!refresh) return null;
  const { response, data } = await requestRaw('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok || !data?.access) return null;
  await tokenStore.saveAccess(data.access);
  return data.access;
}

export async function apiRequest(path, options = {}, retry = true) {
  let access = await tokenStore.getAccess();
  const headers = { ...(options.headers || {}) };
  if (access) headers.Authorization = `Bearer ${access}`;
  let result = await requestRaw(path, { ...options, headers });

  if (result.response.status === 401 && retry) {
    access = await refreshAccessToken();
    if (access) {
      result = await requestRaw(path, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${access}` },
      });
    }
  }

  if (!result.response.ok) {
    const error = result.data || { detail: `Error HTTP ${result.response.status}` };
    error.status = result.response.status;
    throw error;
  }
  return result.data;
}

export async function login(username, password) {
  const { response, data } = await requestRaw('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok || !data?.access || !data?.refresh) {
    throw data || { detail: 'Credenciales inválidas.' };
  }
  await tokenStore.save(data.access, data.refresh);
  return data;
}

export { API_URL };
