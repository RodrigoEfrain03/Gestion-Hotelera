import { apiRequest } from './http';

export const habitacionesApi = {
  list() { return apiRequest('/habitaciones/'); },
  detail(id) { return apiRequest(`/habitaciones/${id}/`); },
  create(payload) { return apiRequest('/habitaciones/', { method: 'POST', body: JSON.stringify(payload) }); },
  update(id, payload) { return apiRequest(`/habitaciones/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); },
};
