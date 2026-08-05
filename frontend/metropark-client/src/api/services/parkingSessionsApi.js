import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const parkingSessionsApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.PARKING_SESSIONS, params),
  getByUser: (userId) => apiClient.get(ENDPOINTS.PARKING_SESSIONS, { user_id: userId }),
  getById: (id) => apiClient.get(`${ENDPOINTS.PARKING_SESSIONS}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.PARKING_SESSIONS, data),
  update: (id, data) => apiClient.put(`${ENDPOINTS.PARKING_SESSIONS}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINTS.PARKING_SESSIONS}/${id}`),
};
