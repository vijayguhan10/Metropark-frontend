import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const paymentMethodsApi = {
  getAll: () => apiClient.get(ENDPOINTS.PAYMENT_METHODS),
  getById: (id) => apiClient.get(`${ENDPOINTS.PAYMENT_METHODS}/${id}`),
};
