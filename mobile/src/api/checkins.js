import { apiRequest } from './http';

export const checkinsApi = {
  list({ estado = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (estado) params.set('estado', estado);
    if (search.trim()) params.set('search', search.trim());
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/checkins/${suffix}`);
  },
  candidatos(search = '') {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/checkins/candidatos/${suffix}`);
  },
  checkin(reserva, observaciones = '') {
    return apiRequest('/checkins/', { method: 'POST', body: JSON.stringify({ reserva, observaciones }) });
  },
  checkout(id, observaciones = '') {
    return apiRequest(`/checkins/${id}/checkout/`, { method: 'POST', body: JSON.stringify({ observaciones }) });
  },
};
