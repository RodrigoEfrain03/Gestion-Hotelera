const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const ACCESS_KEY = "hotel_access";
const REFRESH_KEY = "hotel_refresh";

export const authStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ access, refresh }) => { if (access) localStorage.setItem(ACCESS_KEY, access); if (refresh) localStorage.setItem(REFRESH_KEY, refresh); },
  clear: () => { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); },
};

function formatError(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const parts = Object.entries(data).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    return messages.map((message) => `${field}: ${typeof message === "string" ? message : JSON.stringify(message)}`);
  });
  return parts.length ? parts.join(" · ") : fallback;
}

async function refreshAccess() {
  const refresh = authStorage.getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }) });
  if (!res.ok) { authStorage.clear(); return null; }
  const data = await res.json(); authStorage.set({ access: data.access, refresh: data.refresh || refresh }); return data.access;
}

async function request(path, options = {}, retry = true) {
  const { skipAuth = false, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const access = skipAuth ? null : authStorage.getAccess();
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}), ...(fetchOptions.headers || {}) },
      signal: controller.signal,
    });
    if (response.status === 401 && retry && authStorage.getRefresh()) {
      const next = await refreshAccess();
      if (next) return request(path, options, false);
      window.dispatchEvent(new Event("hotel-auth-expired"));
    }
    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(formatError(data, `Error ${response.status}: no se pudo completar la operación.`));
    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("La conexión tardó demasiado. Verifica que Django esté ejecutándose e inténtalo nuevamente.");
    if (error instanceof TypeError) throw new Error("No se pudo conectar con el servidor. Verifica tu conexión y que Django esté activo.");
    throw error;
  } finally { clearTimeout(timeout); }
}

export const api = {
  login: (payload) => request("/auth/login/", { method: "POST", body: JSON.stringify(payload), skipAuth: true }, false),
  me: () => request("/auth/me/"),
  getUsuarios: () => request("/usuarios/"),
  createUsuario: (payload) => request("/usuarios/", { method: "POST", body: JSON.stringify(payload) }),
  updateUsuario: (id, payload) => request(`/usuarios/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteUsuario: (id) => request(`/usuarios/${id}/`, { method: "DELETE" }),

  getDashboard: () => request("/dashboard/"),
  getClientes: () => request("/clientes/"),
  createCliente: (payload) => request("/clientes/", { method: "POST", body: JSON.stringify(payload) }),
  updateCliente: (id, payload) => request(`/clientes/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteCliente: (id) => request(`/clientes/${id}/`, { method: "DELETE" }),

  getHabitaciones: () => request("/habitaciones/"),
  createHabitacion: (payload) => request("/habitaciones/", { method: "POST", body: JSON.stringify(payload) }),
  updateHabitacion: (id, payload) => request(`/habitaciones/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteHabitacion: (id) => request(`/habitaciones/${id}/`, { method: "DELETE" }),

  getReservas: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== "" && v != null)).toString(); return request(`/reservas/${q ? `?${q}` : ""}`); },
  getDisponibilidad: (entrada, salida, reservaId = "") => request(`/reservas/disponibilidad/?fecha_entrada=${encodeURIComponent(entrada)}&fecha_salida=${encodeURIComponent(salida)}${reservaId ? `&reserva_id=${reservaId}` : ""}`),
  createReserva: (payload) => request("/reservas/", { method: "POST", body: JSON.stringify(payload) }),
  updateReserva: (id, payload) => request(`/reservas/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteReserva: (id) => request(`/reservas/${id}/`, { method: "DELETE" }),

  getCheckins: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== "" && v != null)).toString(); return request(`/checkins/${q ? `?${q}` : ""}`); },
  getCheckinCandidatos: (search = "") => request(`/checkins/candidatos/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createCheckin: (payload) => request("/checkins/", { method: "POST", body: JSON.stringify(payload) }),
  checkout: (id, payload = {}) => request(`/checkins/${id}/checkout/`, { method: "POST", body: JSON.stringify(payload) }),

  getPagos: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== "" && v != null)).toString(); return request(`/pagos/${q ? `?${q}` : ""}`); },
  getResumenPago: (reservaId) => request(`/pagos/resumen/?reserva=${encodeURIComponent(reservaId)}`),
  createPago: (payload) => request("/pagos/", { method: "POST", body: JSON.stringify(payload) }),
  updatePago: (id, payload) => request(`/pagos/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  anularPago: (id) => request(`/pagos/${id}/anular/`, { method: "POST", body: JSON.stringify({}) }),
};

export { API_BASE };
