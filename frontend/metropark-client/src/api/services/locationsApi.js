import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const locationsApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.LOCATIONS, params),
  getById: (id) => apiClient.get(`${ENDPOINTS.LOCATIONS}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.LOCATIONS, data),
  update: (id, data) => apiClient.put(`${ENDPOINTS.LOCATIONS}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINTS.LOCATIONS}/${id}`),
};
