import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const walletApi = {
  addMoney: (data) => apiClient.post(`${ENDPOINTS.WALLET}/add`, data),
  getBalance: (userId) => apiClient.get(`${ENDPOINTS.WALLET}/${userId}`),
};
