import { apiClient } from '../client';

export const gatesApi = {
  getAll: () => apiClient.get('/api/gates'),
  getById: (id) => apiClient.get(`/api/gates/${id}`),
};
