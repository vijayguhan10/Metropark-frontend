import axios from 'axios';
 import { normalizeApiResponse } from '../utils/camelToSnake';

// Create axios instance with base configuration
const analyticsApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
analyticsApi.interceptors.request.use(
  (config) => {
    console.log('🚀 [ANALYTICS API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('❌ [ANALYTICS API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
analyticsApi.interceptors.response.use(
  (response) => {
    console.log('✅ [ANALYTICS API RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ [ANALYTICS API RESPONSE ERROR]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Analytics API endpoints
export const analyticsApiService = {
  // Gates endpoints
  getGates: async () => {
    const response = await analyticsApi.get('/gates');
    return normalizeApiResponse(response.data);
  },

  getGateById: async (id) => {
    const response = await analyticsApi.get(`/gates/${id}`);
    return normalizeApiResponse(response.data);
  },

  // Vehicles endpoints
  getVehicles: async () => {
    const response = await analyticsApi.get('/vehicles');
    return normalizeApiResponse(response.data);
  },

  getVehicleById: async (id) => {
    const response = await analyticsApi.get(`/vehicles/${id}`);
    return normalizeApiResponse(response.data);
  },

  // Locations endpoints
  getLocations: async () => {
    const response = await analyticsApi.get('/locations');
    return normalizeApiResponse(response.data);
  },

  getLocationById: async (id) => {
    const response = await analyticsApi.get(`/locations/${id}`);
    return normalizeApiResponse(response.data);
  },

  // Payments endpoints
  // Payments endpoints
  getPayments: async () => {
    const response = await analyticsApi.get('/payments');
    return normalizeApiResponse(response.data);
  },

  // Payment Methods endpoints
  getPaymentMethods: async () => {
    const response = await analyticsApi.get('/payment-methods');
    return normalizeApiResponse(response.data);
  },

  // Pricing Rates endpoints
  getPricingRates: async () => {
    const response = await analyticsApi.get('/pricing-rates');
    return normalizeApiResponse(response.data);
  },

  // Pricing Rates endpoints
  getPricingRates: async () => {
    const response = await analyticsApi.get('/pricing-rates');
    return normalizeApiResponse(response.data);
  },

  getPricingRateById: async (id) => {
    const response = await analyticsApi.get(`/pricing-rates/${id}`);
    return normalizeApiResponse(response.data);
  },

  resolvePricingRate: async (params) => {
    const response = await analyticsApi.get('/pricing-rates/resolve', { params });
    return normalizeApiResponse(response.data);
  },

  // User parking frequency data
  getUserParkingFrequency: async () => {
    const response = await analyticsApi.get('/admin/user-parking-frequency');
    return normalizeApiResponse(response.data);
  },

  // Get user parking frequency sessions
  getUserParkingFrequencySessions: async () => {
    const response = await analyticsApi.get('/admin/user-parking-frequency/sessions');
    return normalizeApiResponse(response.data);
  },

  // Get all users
  getUsers: async () => {
    const response = await analyticsApi.get('/users');
    return normalizeApiResponse(response.data);
  },

  // Parking Sessions endpoints
  getParkingSessions: async () => {
    const response = await analyticsApi.get('/parking-sessions');
    return normalizeApiResponse(response.data);
  },

  getParkingSessionById: async (id) => {
    const response = await analyticsApi.get(`/parking-sessions/${id}`);
    return normalizeApiResponse(response.data);
  },
};

export default analyticsApi;
