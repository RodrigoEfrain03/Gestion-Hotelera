import { apiRequest } from './http';

export const clientesApi = {
  list() { return apiRequest('/clientes/'); },
  detail(id) { return apiRequest(`/clientes/${id}/`); },
  create(payload) { return apiRequest('/clientes/', { method: 'POST', body: JSON.stringify(payload) }); },
  update(id, payload) { return apiRequest(`/clientes/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }); },
};
