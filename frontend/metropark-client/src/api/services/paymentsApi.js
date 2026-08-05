import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const paymentsApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.PAYMENTS, params),
  getByUser: (userId) => apiClient.get(ENDPOINTS.PAYMENTS, { user_id: userId }),
  getById: (id) => apiClient.get(`${ENDPOINTS.PAYMENTS}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.PAYMENTS, data),
  update: (id, data) => apiClient.put(`${ENDPOINTS.PAYMENTS}/${id}`, data),
};
