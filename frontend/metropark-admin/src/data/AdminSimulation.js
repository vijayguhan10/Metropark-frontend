// adminsimulate.js

// Utility to generate unique IDs with prefixes
export const generateId = (prefix) => 
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

// Static Mock Data configurations
export const MockConfig = {
  locationTypes: [{ type_name: "PERMANENT_RETAIL" }, { type_name: "TEMPORARY_EVENT" }],
  vehicleTypes: [{ type_display_name: "Car" }, { type_display_name: "Bike" }, { type_display_name: "Delivery" }],
  reservationClasses: [{ class_name: "General" }, { class_name: "VIP" }]
};

// --- Domain Generators ---

export const generateMasterData = () => {
  return {
    locationTypes: MockConfig.locationTypes.map(f => ({ type_id: generateId("LTYP"), ...f })),
    vehicleTypes: MockConfig.vehicleTypes.map(f => ({ vehicle_type_id: generateId("VTYP"), ...f })),
    reservationClasses: MockConfig.reservationClasses.map(f => ({ class_id: generateId("RCLS"), ...f }))
  };
};

export const generateLocations = (formInput, adminData) => {
  const locTypes = adminData.locationTypes || [];
  if (!locTypes.length) throw new Error("Please generate Master Data first.");

  const location = { 
    location_id: generateId("LOC"), 
    type_id: locTypes[0].type_id, 
    ...formInput 
  };

  const eventMetadata = { 
    event_id: generateId("EVT"), 
    location_id: location.location_id, 
    start_time: new Date().toISOString(), 
    end_time: new Date(Date.now() + 86400000 * 3).toISOString() // +3 days
  };

  return { locations: [location], eventMetadata: [eventMetadata] };
};

export const generateGates = (adminData) => {
  const locs = adminData.locations || [];
  if (!locs.length) throw new Error("Please generate Locations first.");

  const gates = [
    { gate_name: "Main Entry", gate_type: "ENTRY" }, 
    { gate_name: "Main Exit", gate_type: "EXIT" }
  ].map(f => ({
    gate_id: generateId("GATE"),
    location_id: locs[0].location_id,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...f
  }));

  return { gates };
};

export const generateParkingSlots = (count, adminData) => {
  const { locations, vehicleTypes, reservationClasses } = adminData;
  if (!locations?.length || !vehicleTypes?.length || !reservationClasses?.length) {
    throw new Error("Generate Master Data and Locations first.");
  }

  const parkingSlots = Array.from({ length: count }).map((_, i) => ({
    slot_id: generateId("SLOT"),
    location_id: locations[0].location_id,
    display_code: `SLOT-${String(i + 1).padStart(3, '0')}`,
    vehicle_type_id: vehicleTypes[i % vehicleTypes.length].vehicle_type_id,
    reservation_class_id: reservationClasses[i % reservationClasses.length].class_id,
    sensor_id: `SENS-${Math.floor(Math.random() * 9000) + 1000}`,
    current_status: "AVAILABLE",
    slot_version: 1,
    updated_at: new Date().toISOString(),
  }));

  return { parkingSlots };
};