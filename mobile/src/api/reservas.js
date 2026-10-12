import { apiRequest } from './http';

export const reservasApi = {
  list({ search = '', estado = '' } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (estado) params.set('estado', estado);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reservas/${suffix}`);
  },
  detail(id) { return apiRequest(`/reservas/${id}/`); },
  create(payload) {
    return apiRequest('/reservas/', { method: 'POST', body: JSON.stringify(payload) });
  },
  disponibilidad(fechaEntrada, fechaSalida) {
    const params = new URLSearchParams({ fecha_entrada: fechaEntrada, fecha_salida: fechaSalida });
    return apiRequest(`/reservas/disponibilidad/?${params.toString()}`);
  },
  clientes() { return apiRequest('/clientes/'); },
};
