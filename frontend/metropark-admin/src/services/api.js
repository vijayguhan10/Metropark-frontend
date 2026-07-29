import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 [API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
    // Add auth token if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('❌ [API RESPONSE ERROR]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    });
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

// API endpoints matching the backend specification
export const apiService = {
  // Master Data
  locationTypes: {
    create: (data) => api.post('/location-types', data),
    getAll: () => api.get('/location-types'),
  },
  vehicleTypes: {
    create: (data) => api.post('/vehicle-types', data),
    getAll: () => api.get('/vehicle-types'),
  },
  reservationClasses: {
    create: (data) => api.post('/reservation-classes', data),
    getAll: () => api.get('/reservation-classes'),
  },
  paymentMethods: {
    create: (data) => api.post('/payment-methods', data),
    getAll: () => api.get('/payment-methods'),
  },

  // Locations & Events
  locations: {
    create: (data) => api.post('/locations', data),
    getAll: () => api.get('/locations'),
    updateStatus: (locationId, status) => api.patch(`/locations/${locationId}/status`, null, { params: { status } }),
  },

  // Gates
  gates: {
    create: (data) => api.post('/gates', data),
    getAll: () => api.get('/gates'),
    updateStatus: (gateId, status) => api.patch(`/gates/${gateId}/status`, null, { params: { status } }),
  },

  // Parking Slots
  parkingSlots: {
    create: (data) => api.post('/parking-slots', data),
    getAll: () => api.get('/parking-slots'),
  },

  // Pricing Rates
  pricingRates: {
    create: (data) => api.post('/pricing-rates', data),
    getAll: () => api.get('/pricing-rates'),
    resolve: (params) => api.get('/pricing-rates/resolve', { params }),
  },
};

// Helper function to post data with toast notifications
export const postWithToast = async (apiCall, data, successMessage, errorMessage) => {
  try {
    const response = await apiCall(data);
    toast.success(successMessage || 'Data posted successfully');
    return response.data;
  } catch (error) {
    toast.error(errorMessage || error.response?.data?.message || 'Failed to post data');
    throw error;
  }
};

// Sequential API execution with proper dependency order
// Dependency order: master data -> locations -> gates -> parking slots -> pricing rates
const DEPENDENCY_ORDER = [
  'locationTypes',
  'vehicleTypes', 
  'reservationClasses',
  'paymentMethods',
  'locations',
  'gates',
  'parkingSlots',
  'pricingRates'
];

// Helper to post a single module's data sequentially and return response data with IDs
const postModuleData = async (module, data, idMappings) => {
  const responses = [];
  
  switch (module) {
    case 'locationTypes':
      for (const item of data) {
        // Don't send typeId - backend generates it
        const { typeId, ...payload } = item;
        const response = await apiService.locationTypes.create(payload);
        const responseData = response.data;
        responses.push(responseData);
        // Map the generated typeId by typeName for later use
        if (responseData.typeId && item.typeName) {
          idMappings.locationTypeByName[item.typeName] = responseData.typeId;
        }
      }
      break;
    case 'vehicleTypes':
      for (const item of data) {
        const response = await apiService.vehicleTypes.create(item);
        const responseData = response.data;
        responses.push(responseData);
        // Map the generated vehicleTypeId by typeDisplayName for later use
        if (responseData.vehicleTypeId && item.typeDisplayName) {
          idMappings.vehicleTypeByName[item.typeDisplayName] = responseData.vehicleTypeId;
        }
      }
      break;
    case 'reservationClasses':
      for (const item of data) {
        const response = await apiService.reservationClasses.create(item);
        const responseData = response.data;
        responses.push(responseData);
        // Map the generated classId by className for later use
        if (responseData.classId && item.className) {
          idMappings.reservationClassByName[item.className] = responseData.classId;
        }
      }
      break;
    case 'paymentMethods':
      for (const item of data) {
        const response = await apiService.paymentMethods.create(item);
        const responseData = response.data;
        responses.push(responseData);
        // Map the generated methodId by methodName for later use
        if (responseData.methodId && item.methodName) {
          idMappings.paymentMethodByName[item.methodName] = responseData.methodId;
        }
      }
      break;
    case 'locations':
      for (const item of data) {
        // Replace typeId with backend-generated typeId from locationTypes
        let payload = { ...item };
        if (item.typeId && typeof item.typeId === 'number') {
          // Find the location type by index in MockConfig
          const locationTypeNames = ['PERMANENT_RETAIL', 'TEMPORARY_EVENT', 'AIRPORT_PARKING', 'MALL_PARKING'];
          const typeName = locationTypeNames[item.typeId - 1];
          if (typeName && idMappings.locationTypeByName[typeName]) {
            payload.typeId = idMappings.locationTypeByName[typeName];
          }
        }
        const response = await apiService.locations.create(payload);
        const responseData = response.data;
        responses.push(responseData);
        // Map the generated locationId by locationId (client-side) for later use
        if (responseData.locationId && item.locationId) {
          idMappings.locationByClientId[item.locationId] = responseData.locationId;
        }
      }
      break;
    case 'gates':
      for (const item of data) {
        // Replace locationId with backend-generated locationId
        let payload = { ...item };
        if (item.locationId && idMappings.locationByClientId[item.locationId]) {
          payload.locationId = idMappings.locationByClientId[item.locationId];
        }
        const response = await apiService.gates.create(payload);
        const responseData = response.data;
        responses.push(responseData);
      }
      break;
    case 'parkingSlots':
      // Backend expects an array of parking slots
      const parkingSlotsPayload = data.map(item => {
        let payload = { ...item };
        // Remove slotId - backend generates it (SERIAL)
        delete payload.slotId;
        if (item.locationId && idMappings.locationByClientId[item.locationId]) {
          payload.locationId = idMappings.locationByClientId[item.locationId];
        }
        // Replace vehicleTypeId with backend-generated vehicleTypeId
        if (item.vehicleTypeId && idMappings.vehicleTypeByClientId[item.vehicleTypeId]) {
          payload.vehicleTypeId = idMappings.vehicleTypeByClientId[item.vehicleTypeId];
        }
        // Replace reservationClassId with backend-generated classId
        if (item.reservationClassId && idMappings.reservationClassByClientId[item.reservationClassId]) {
          payload.reservationClassId = idMappings.reservationClassByClientId[item.reservationClassId];
        }
        return payload;
      });
      const response = await apiService.parkingSlots.create(parkingSlotsPayload);
      const responseData = response.data;
      // Backend returns array of created slots
      if (Array.isArray(responseData)) {
        responses.push(...responseData);
      } else {
        responses.push(responseData);
      }
      break;
    case 'pricingRates':
      for (const item of data) {
        // Replace locationId with backend-generated locationId
        let payload = { ...item };
        if (item.locationId && idMappings.locationByClientId[item.locationId]) {
          payload.locationId = idMappings.locationByClientId[item.locationId];
        }
        // Replace vehicleTypeId with backend-generated vehicleTypeId
        if (item.vehicleTypeId && idMappings.vehicleTypeByClientId[item.vehicleTypeId]) {
          payload.vehicleTypeId = idMappings.vehicleTypeByClientId[item.vehicleTypeId];
        }
        const response = await apiService.pricingRates.create(payload);
        const responseData = response.data;
        responses.push(responseData);
      }
      break;
    default:
      throw new Error(`Unknown module: ${module}`);
  }
  
  return responses;
};

// Bulk post helper with sequential execution and dependency order
export const postAllModules = async (modules, adminData, onProgress) => {
  const results = { success: [], failed: [] };
  
  // ID mappings to track backend-generated IDs
  const idMappings = {
    locationTypeByName: {},      // typeName -> backend typeId
    vehicleTypeByName: {},       // typeDisplayName -> backend vehicleTypeId
    reservationClassByName: {},  // className -> backend classId
    paymentMethodByName: {},     // methodName -> backend methodId
    locationByClientId: {},      // client locationId -> backend locationId
    vehicleTypeByClientId: {},   // client vehicleTypeId -> backend vehicleTypeId
    reservationClassByClientId: {} // client classId -> backend classId
  };
  
  // Pre-populate client-side ID mappings from adminData
  if (adminData.vehicleTypes) {
    adminData.vehicleTypes.forEach(vt => {
      if (vt.vehicleTypeId) {
        idMappings.vehicleTypeByClientId[vt.vehicleTypeId] = vt.vehicleTypeId;
      }
    });
  }
  if (adminData.reservationClasses) {
    adminData.reservationClasses.forEach(rc => {
      if (rc.classId) {
        idMappings.reservationClassByClientId[rc.classId] = rc.classId;
      }
    });
  }
  
  // Sort modules by dependency order
  const sortedModules = modules.sort((a, b) => {
    const indexA = DEPENDENCY_ORDER.indexOf(a);
    const indexB = DEPENDENCY_ORDER.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  
  for (const module of sortedModules) {
    if (onProgress) onProgress(module, 'posting');
    
    try {
      const data = adminData[module];
      if (!data || data.length === 0) {
        results.failed.push({ module, error: 'No data to post' });
        if (onProgress) onProgress(module, 'skipped');
        continue;
      }

      await postModuleData(module, data, idMappings);
      
      results.success.push(module);
      toast.success(`${module} posted successfully`);
      if (onProgress) onProgress(module, 'success');
      
      // Small delay between modules to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      results.failed.push({ module, error: error.message });
      toast.error(`Failed to post ${module}: ${error.message}`);
      if (onProgress) onProgress(module, 'error');
      
      // Stop on first failure to maintain data integrity
      throw error;
    }
  }
  
  return results;
};

// Export dependency order for external use
export const getDependencyOrder = () => [...DEPENDENCY_ORDER];

export default api;
