import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const parkingSlotsApi = {
  getAll: (params) => apiClient.get(ENDPOINTS.PARKING_SLOTS, params),
  getByLocation: (locationId) => apiClient.get(ENDPOINTS.PARKING_SLOTS, { location_id: locationId }),
  getById: (id) => apiClient.get(`${ENDPOINTS.PARKING_SLOTS}/${id}`),
  create: (data) => apiClient.post(ENDPOINTS.PARKING_SLOTS, data),
  update: (id, data) => apiClient.put(`${ENDPOINTS.PARKING_SLOTS}/${id}`, data),
  remove: (id) => apiClient.delete(`${ENDPOINTS.PARKING_SLOTS}/${id}`),
  
  checkAvailability: (locationId, { fromDate, toDate }) => 
    apiClient.post(`${ENDPOINTS.PARKING_SLOTS}/availability`, {
      locationID: locationId,
      fromDate,
      toDate,
    }),
};
