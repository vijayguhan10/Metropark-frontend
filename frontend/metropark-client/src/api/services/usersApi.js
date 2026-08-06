import { apiClient } from '../client';

const ENDPOINT = '/api/users';

export const usersApi = {
  create: (data) => apiClient.post(ENDPOINT, data),
  getById: (id) => apiClient.get(`${ENDPOINT}/${id}`),
  login: (phone) => apiClient.post(`${ENDPOINT}/login`, null, { phone }),
};
