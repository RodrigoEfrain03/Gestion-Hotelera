import { apiRequest } from './http';

export const pagosApi = {
  list({ reserva = '', estado = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (reserva) params.set('reserva', String(reserva));
    if (estado) params.set('estado', estado);
    if (search.trim()) params.set('search', search.trim());
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/pagos/${suffix}`);
  },
  resumen(reserva) {
    return apiRequest(`/pagos/resumen/?reserva=${encodeURIComponent(reserva)}`);
  },
  create(payload) {
    return apiRequest('/pagos/', { method: 'POST', body: JSON.stringify(payload) });
  },
  anular(id) {
    return apiRequest(`/pagos/${id}/anular/`, { method: 'POST', body: JSON.stringify({}) });
  },
};
