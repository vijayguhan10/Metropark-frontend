import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const vehiclesApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.VEHICLES, params),
  getByUser: (userId) => apiClient.get(ENDPOINTS.VEHICLES, { user_id: userId }),
  getByUserPath: (userId) => apiClient.get(`${ENDPOINTS.VEHICLES}/user/${userId}`),
  getById: (id) => apiClient.get(`${ENDPOINTS.VEHICLES}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.VEHICLES, data),
  update: (id, data) => apiClient.put(`${ENDPOINTS.VEHICLES}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINTS.VEHICLES}/${id}`),
};
