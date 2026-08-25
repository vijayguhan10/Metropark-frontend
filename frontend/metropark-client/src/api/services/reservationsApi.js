import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

const toIntUserId = (uid) => {
  const n = parseInt(uid, 10);
  return Number.isFinite(n) ? n : uid;
};

export const reservationsApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.RESERVATIONS, params),
  getByUser: (userId) => apiClient.get(ENDPOINTS.RESERVATIONS, { user_id: toIntUserId(userId) }),
  getById: (id) => apiClient.get(`${ENDPOINTS.RESERVATIONS}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.RESERVATIONS, {
    ...data,
    userId: toIntUserId(data.userId ?? data.user_id),
  }),
  update: (id, data) => apiClient.put(`${ENDPOINTS.RESERVATIONS}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINTS.RESERVATIONS}/${id}`),
};
