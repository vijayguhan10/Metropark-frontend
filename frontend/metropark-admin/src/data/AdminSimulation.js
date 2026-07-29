// adminsimulate.js

// Utility to generate unique IDs with prefixes
export const generateId = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// Static Mock Data configurations matching backend API specs (camelCase for backend)
// Note: locations, vehicleTypes, and reservationClasses are now fetched from backend
// Only locationTypes, paymentMethods remain as mock configs
// gates and pricingRates are now fully editable via UI (no static mock data)
export const MockConfig = {
  locationTypes: [
    { typeName: "PERMANENT_RETAIL" },
    { typeName: "TEMPORARY_EVENT" },
    { typeName: "AIRPORT_PARKING" },
    { typeName: "MALL_PARKING" }
  ],
  paymentMethods: [
    { methodName: "CASH", isActive: true },
    { methodName: "CREDIT_CARD", isActive: true },
    { methodName: "UPI", isActive: true },
    { methodName: "WALLET", isActive: true }
  ]
};

// --- Domain Generators ---

export const generateMasterData = () => {
  return {
    // Don't include typeId - backend generates it
    locationTypes: MockConfig.locationTypes.map(f => ({ ...f })),
    // vehicleTypes and reservationClasses are now fetched from backend
    // paymentMethods are still generated locally
    paymentMethods: MockConfig.paymentMethods.map(f => ({ methodId: generateId("PMTH"), ...f }))
  };
};

// Helper to create a lookup map from generated data
export const createIdLookup = (dataArray, idField) => {
  const lookup = {};
  dataArray.forEach(item => {
    if (item[idField]) {
      lookup[item[idField]] = item;
    }
  });
  return lookup;
};

export const generateLocations = (formInput, adminData) => {
  const locTypes = adminData.locationTypes || [];
  if (!locTypes.length) throw new Error("Please generate Master Data first.");

  // Validate typeId is between 1-4
  const typeId = parseInt(formInput.typeId) || 1;
  if (typeId < 1 || typeId > 4) {
    throw new Error("Type ID must be between 1 and 4");
  }

  // Use formInput for location data (matches backend DTO: locationId, typeId, locationName, city, status)
  const locations = [{
    locationId: formInput.locationId || `LOC-${Date.now().toString(36).toUpperCase()}`,
    typeId: typeId,
    locationName: formInput.locationName || "New Location",
    city: formInput.city || "CityCenter",
    status: formInput.status || "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }];

  const eventMetadata = locations.map(loc => ({
    eventId: generateId("EVT"),
    locationId: loc.locationId,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3).toISOString() // +3 days
  }));

  return { locations, eventMetadata };
};

export const generateGates = (adminData, masterData, selectedOptions = {}) => {
  // Use fetched master data (from backend) for locations
  // Fall back to adminData for backward compatibility
  const locations = masterData?.locations || adminData?.locations || [];

  if (!locations?.length) {
    throw new Error("Locations not available. Please wait for data to load from backend.");
  }

  const { locationId } = selectedOptions;

  const selectedLocation = locationId 
    ? locations.find(l => l.locationId === locationId)
    : null;

  // Validate selected location exists
  if (locationId && !selectedLocation) {
    throw new Error(`Selected location ${locationId} not found in master data`);
  }

  // If no location selected, return empty array (user will add gates manually via UI)
  if (!selectedLocation) {
    return { gates: [] };
  }

  // Generate gates for the selected location only
  const gateConfigs = [
    { gateName: `Main Entry Gate A`, gateType: "ENTRY" },
    { gateName: `Main Entry Gate B`, gateType: "ENTRY" },
    { gateName: `Main Exit Gate A`, gateType: "EXIT" },
    { gateName: `Main Exit Gate B`, gateType: "EXIT" },
  ];

  const gates = gateConfigs.map(config => ({
    locationId: selectedLocation.locationId, // Use backend locationId
    gateName: config.gateName,
    gateType: config.gateType,
    status: "ACTIVE"
  }));

  return { gates };
};

export const generateParkingSlots = (count, adminData, masterData, selectedOptions = {}) => {
  // Use fetched master data (from backend) for locations, vehicleTypes, reservationClasses
  // Fall back to adminData for backward compatibility
  const locations = masterData?.locations || adminData?.locations || [];
  const vehicleTypes = masterData?.vehicleTypes || adminData?.vehicleTypes || [];
  const reservationClasses = masterData?.reservationClasses || adminData?.reservationClasses || [];

  if (!locations?.length || !vehicleTypes?.length || !reservationClasses?.length) {
    throw new Error("Master data (locations, vehicle types, reservation classes) not available. Please wait for data to load from backend.");
  }

  // If specific options are selected, use them; otherwise fall back to round-robin distribution
  const { locationId, vehicleTypeId, reservationClassId } = selectedOptions;
  
  // Parse form values to numbers for comparison (form values are strings from select inputs)
  const parsedVehicleTypeId = vehicleTypeId ? parseInt(vehicleTypeId, 10) : null;
  const parsedReservationClassId = reservationClassId ? parseInt(reservationClassId, 10) : null;

  const selectedLocation = locationId 
    ? locations.find(l => l.locationId === locationId)
    : null;
  const selectedVehicleType = parsedVehicleTypeId !== null
    ? vehicleTypes.find(vt => vt.vehicleTypeId === parsedVehicleTypeId)
    : null;
  const selectedReservationClass = parsedReservationClassId !== null
    ? reservationClasses.find(rc => rc.classId === parsedReservationClassId)
    : null;

  // Validate selected options exist
  if (locationId && !selectedLocation) {
    throw new Error(`Selected location ${locationId} not found in master data`);
  }
  if (vehicleTypeId && !selectedVehicleType) {
    throw new Error(`Selected vehicle type ${vehicleTypeId} not found in master data`);
  }
  if (reservationClassId && !selectedReservationClass) {
    throw new Error(`Selected reservation class ${reservationClassId} not found in master data`);
  }

  const parkingSlots = Array.from({ length: count }).map((_, i) => {
    // Use selected options if provided, otherwise fall back to round-robin
    const location = selectedLocation || locations[i % locations.length];
    const vehicleType = selectedVehicleType || vehicleTypes[i % vehicleTypes.length];
    const reservationClass = selectedReservationClass || reservationClasses[i % reservationClasses.length];

    // Generate display codes like A-01, A-02, B-01, etc.
    const section = String.fromCharCode(65 + Math.floor(i / 5)); // A, B, C, D, E
    const slotNum = String((i % 5) + 1).padStart(2, '0');

    return {
      // slotId is auto-generated by backend (SERIAL), don't send it
      locationId: location.locationId, // Use backend locationId
      displayCode: `${section}-${slotNum}`,
      vehicleTypeId: vehicleType.vehicleTypeId, // Use backend vehicleTypeId
      reservationClassId: reservationClass.classId, // Use backend classId
      sensorId: `SENSOR-${section}${slotNum}`,
      currentStatus: "AVAILABLE",
      slotVersion: 1,
      updatedAt: new Date().toISOString()
    };
  });

  return { parkingSlots };
};

export const generatePricingRates = (adminData, masterData, selectedOptions = {}) => {
  // Use fetched master data (from backend) for locations, vehicleTypes, reservationClasses
  // Fall back to adminData for backward compatibility
  const locations = masterData?.locations || adminData?.locations || [];
  const vehicleTypes = masterData?.vehicleTypes || adminData?.vehicleTypes || [];
  const reservationClasses = masterData?.reservationClasses || adminData?.reservationClasses || [];

  if (!locations?.length || !vehicleTypes?.length || !reservationClasses?.length) {
    throw new Error("Master data (locations, vehicle types, reservation classes) not available. Please wait for data to load from backend.");
  }

  const { locationId, vehicleTypeId, reservationClassId } = selectedOptions;
  
  // Parse form values to numbers for comparison (form values are strings from select inputs)
  const parsedVehicleTypeId = vehicleTypeId ? parseInt(vehicleTypeId, 10) : null;
  const parsedReservationClassId = reservationClassId ? parseInt(reservationClassId, 10) : null;

  const selectedLocation = locationId 
    ? locations.find(l => l.locationId === locationId)
    : null;
  const selectedVehicleType = parsedVehicleTypeId !== null
    ? vehicleTypes.find(vt => vt.vehicleTypeId === parsedVehicleTypeId)
    : null;
  const selectedReservationClass = parsedReservationClassId !== null
    ? reservationClasses.find(rc => rc.classId === parsedReservationClassId)
    : null;

  // Validate selected options exist
  if (locationId && !selectedLocation) {
    throw new Error(`Selected location ${locationId} not found in master data`);
  }
  if (vehicleTypeId && !selectedVehicleType) {
    throw new Error(`Selected vehicle type ${vehicleTypeId} not found in master data`);
  }
  if (reservationClassId && !selectedReservationClass) {
    throw new Error(`Selected reservation class ${reservationClassId} not found in master data`);
  }

  // If no location, vehicle type, or reservation class selected, return empty array (user will add manually)
  if (!selectedLocation || !selectedVehicleType || !selectedReservationClass) {
    return { pricingRates: [] };
  }

  // Generate a single pricing rate for the selected location, vehicle type, and reservation class
  const now = new Date();
  const effectiveFrom = now.toISOString();
  const effectiveTo = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59).toISOString(); // End of next year

  const pricingRate = {
    // rateId is auto-generated by backend (Long), don't send it
    locationId: selectedLocation.locationId, // Use backend locationId
    vehicleTypeId: selectedVehicleType.vehicleTypeId, // Use backend vehicleTypeId
    reservationClassId: selectedReservationClass.classId, // Use backend classId
    baseRate: 50.00,
    currency: "INR",
    effectiveFrom: effectiveFrom,
    effectiveTo: effectiveTo,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { pricingRates: [pricingRate] };
};

// Generate all mock data at once (for "Generate Mock Data" button)
// masterData parameter should contain backend-fetched data (vehicleTypes, reservationClasses, locations)
export const generateAllMockData = (formInput, adminData, masterData = {}) => {
  const localMasterData = generateMasterData();
  const locationsData = generateLocations(formInput, { ...adminData, ...localMasterData });
  const gatesData = generateGates({ ...adminData, ...localMasterData, ...locationsData });
  // Note: parkingSlots now requires masterData from backend, so we can't generate it in all-mock
  // The user should generate parking slots separately after master data loads
  // Merge local masterData with backend masterData for pricing rates generation
  const mergedData = { ...adminData, ...localMasterData, ...locationsData, ...masterData };
  const pricingData = generatePricingRates(mergedData);

  return {
    ...localMasterData,
    ...locationsData,
    ...gatesData,
    ...pricingData
  };
};

// Get all payloads for "View Data Payload" modal
export const getAllPayloads = (formInput, adminData, masterData = {}) => {
  const allData = generateAllMockData(formInput, adminData, masterData);

  return {
    masterData: {
      locationTypes: allData.locationTypes,
      vehicleTypes: allData.vehicleTypes,
      reservationClasses: allData.reservationClasses,
      paymentMethods: allData.paymentMethods
    },
    locations: {
      locations: allData.locations
    },
    gates: {
      gates: allData.gates
    },
    parkingSlots: {
      parkingSlots: allData.parkingSlots
    },
    pricingRates: {
      pricingRates: allData.pricingRates
    }
  };
};