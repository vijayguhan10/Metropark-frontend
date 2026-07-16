import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AdminDataContext = createContext(null);
const ADMIN_DATA_STORAGE_KEY = "metropark-admin-simulation-data";
const defaultAdminData = {
  locations: [],
  gates: [],
  vehicleTypes: [],
  reservationClasses: [],
  billingTypes: [],
  pricingRates: [],
  paymentMethods: [],
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ADMIN_DATA_STORAGE_KEY, JSON.stringify(adminData));
  }, [adminData]);

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
  }, []);

  const value = {
    adminData,
    updateAdminData,
    replaceAdminData,
    clearAdminData,
    clearAllAdminData,
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
