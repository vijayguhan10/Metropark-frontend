import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiService } from "../services/api";

const AdminDataContext = createContext(null);
const ADMIN_DATA_STORAGE_KEY = "metropark-admin-simulation-data";
const defaultAdminData = {
  locationTypes: [],
  locations: [],
  gates: [],
  vehicleTypes: [],
  reservationClasses: [],
  billingTypes: [],
  pricingRates: [],
  paymentMethods: [],
  eventMetadata: [],
  parkingSlots: [],
};

export function AdminDataProvider({ children }) {
  const [adminData, setAdminData] = useState(() => {
    if (typeof window === "undefined") {
      return defaultAdminData;
    }

    try {
      const stored = window.localStorage.getItem(ADMIN_DATA_STORAGE_KEY);
      return stored ? { ...defaultAdminData, ...JSON.parse(stored) } : defaultAdminData;
    } catch {
      return defaultAdminData;
    }
  });

  // Track posted status for each module
  const [postedModules, setPostedModules] = useState({});

  // Master data fetched from backend
  const [masterData, setMasterData] = useState({
    locations: [],
    vehicleTypes: [],
    reservationClasses: [],
  });
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [masterDataError, setMasterDataError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ADMIN_DATA_STORAGE_KEY, JSON.stringify(adminData));
  }, [adminData]);

  // Fetch master data from backend
  const fetchMasterData = useCallback(async () => {
    setMasterDataLoading(true);
    setMasterDataError(null);
    try {
      const [locationsRes, vehicleTypesRes, reservationClassesRes] = await Promise.all([
        apiService.locations.getAll(),
        apiService.vehicleTypes.getAll(),
        apiService.reservationClasses.getAll(),
      ]);

      setMasterData({
        locations: locationsRes.data || [],
        vehicleTypes: vehicleTypesRes.data || [],
        reservationClasses: reservationClassesRes.data || [],
      });
    } catch (error) {
      console.error("Failed to fetch master data:", error);
      setMasterDataError(error.message || "Failed to fetch master data");
    } finally {
      setMasterDataLoading(false);
    }
  }, []);

  // Fetch master data on initialization
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const updateAdminData = useCallback((module, data) => {
    setAdminData((prev) => ({
      ...prev,
      [module]: [...(prev[module] || []), ...(Array.isArray(data) ? data : [data])],
    }));
  }, []);

  const replaceAdminData = useCallback((module, data) => {
    setAdminData((prev) => ({
      ...prev,
      [module]: Array.isArray(data) ? data : [data],
    }));
  }, []);

  const clearAdminData = useCallback((module) => {
    setAdminData((prev) => ({
      ...prev,
      [module]: [],
    }));
  }, []);

  const clearAllAdminData = useCallback(() => {
    setAdminData(defaultAdminData);
    setPostedModules({});
  }, []);

  const setModulePosted = useCallback((module, posted) => {
    setPostedModules((prev) => ({ ...prev, [module]: posted }));
  }, []);

  const clearPostedStatus = useCallback(() => {
    setPostedModules({});
  }, []);

  const value = {
    adminData,
    updateAdminData,
    replaceAdminData,
    clearAdminData,
    clearAllAdminData,
    postedModules,
    setModulePosted,
    clearPostedStatus,
    masterData,
    masterDataLoading,
    masterDataError,
    fetchMasterData,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}