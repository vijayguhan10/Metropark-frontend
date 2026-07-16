// clientsimulate.js

export const generateId = (prefix) => 
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

export const randomDate = (start, end) => 
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// --- Static Data Dictionaries ---
const indianNames = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh", "Anjali Gupta",
  "Rahul Verma", "Pooja Mehta", "Arjun Nair", "Kavya Iyer", "Sanjay Joshi", "Meera Krishnan",
  "Rohit Agarwal", "Deepika Shah", "Karan Malhotra", "Nisha Bansal", "Aditya Rao", "Shreya Menon",
  "Varun Kapoor", "Divya Choudhary", "Nikhil Jain", "Riya Saxena", "Pranav Desai", "Aisha Khan",
];

const indianCities = [
  { city: "Mumbai", state: "Maharashtra", code: "MH" },
  { city: "Delhi", state: "Delhi", code: "DL" },
  { city: "Bangalore", state: "Karnataka", code: "KA" },
  { city: "Hyderabad", state: "Telangana", code: "TS" },
  { city: "Chennai", state: "Tamil Nadu", code: "TN" },
  { city: "Pune", state: "Maharashtra", code: "MH" },
];

const vehicleBrands = {
  SUV_LUX: ["BMW", "Mercedes", "Audi", "Land Rover", "Porsche"],
  SEDAN: ["Honda", "Toyota", "Hyundai", "Skoda", "Volkswagen"],
  SUV_STD: ["Mahindra", "Tata", "Toyota", "Hyundai", "Kia"],
  HATCH: ["Maruti", "Hyundai", "Tata", "Honda", "Renault"],
  MOTO: ["Hero", "Honda", "TVS", "Bajaj", "Royal Enfield", "Yamaha"],
};

const colors = ["Black", "White", "Silver", "Grey", "Blue", "Red", "Brown"];
const sessionStatuses = ["ACTIVE", "EXITED", "CANCELLED"];
const paymentStatuses = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"];

const fallbackPaymentMethods = [
  { method_id: "PM-1", method_name: "CREDIT_CARD", label: "Credit Card" },
  { method_id: "PM-2", method_name: "UPI", label: "UPI" },
  { method_id: "PM-3", method_name: "CASH", label: "Cash" },
];

// --- Domain Generators ---

export const generateUsers = (count) => {
  return Array.from({ length: count }).map((_, i) => {
    const cityData = indianCities[Math.floor(Math.random() * indianCities.length)];
    const name = indianNames[Math.floor(Math.random() * indianNames.length)] + ` ${i + 1}`;
    
    return {
      user_id: generateId("USR"),
      name,
      email: name.toLowerCase().replace(/\s+/g, ".") + `@email.com`,
      phone: `+91-${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      city: cityData.city,
      state: cityData.state,
      created_at: randomDate(new Date("2023-01-01"), new Date()).toISOString(),
      updated_at: new Date().toISOString(),
      total_sessions: 0,
      total_spent: 0,
    };
  });
};

export const generateVehicles = (users, adminData, vehiclesPerUser = 1) => {
  if (!users?.length) throw new Error("Please generate Users first.");
  if (!adminData?.vehicleTypes?.length) throw new Error("Admin Data missing: Vehicle Types required.");

  const vehicles = [];
  users.forEach((user) => {
    for (let i = 0; i < vehiclesPerUser; i++) {
      const vt = adminData.vehicleTypes[Math.floor(Math.random() * adminData.vehicleTypes.length)];
      
      // Fallback for types if they don't exactly match the mock dict
      const brandList = vehicleBrands[vt.type_code] || vehicleBrands.SEDAN;
      const brand = brandList[Math.floor(Math.random() * brandList.length)];
      const cityCode = indianCities.find(c => c.city === user.city)?.code || "MH";
      const vehicleNumber = `${cityCode}${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}`;
      
      vehicles.push({
        vehicle_id: generateId("VEH"),
        user_id: user.user_id,
        vehicle_number: vehicleNumber,
        vehicle_type_id: vt.vehicle_type_id,
        brand,
        color: colors[Math.floor(Math.random() * colors.length)],
        is_active: true,
        created_at: randomDate(new Date(user.created_at), new Date()).toISOString(),
      });
    }
  });
  return vehicles;
};

export const generateSessions = (users, vehicles, adminData, count = 10) => {
  if (!users?.length || !vehicles?.length) throw new Error("Users and Vehicles required.");
  if (!adminData?.locations?.length || !adminData?.gates?.length || !adminData?.parkingSlots?.length) {
    throw new Error("Admin Data missing: Locations, Gates, and Slots required.");
  }

  const sessions = [];
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const userVehicles = vehicles.filter(v => v.user_id === user.user_id);
    if (!userVehicles.length) continue;
    
    const vehicle = userVehicles[Math.floor(Math.random() * userVehicles.length)];
    const location = adminData.locations[Math.floor(Math.random() * adminData.locations.length)];
    const slot = adminData.parkingSlots[Math.floor(Math.random() * adminData.parkingSlots.length)];
    
    const entryGates = adminData.gates.filter(g => g.location_id === location.location_id && ["ENTRY", "BOTH"].includes(g.gate_type));
    const exitGates = adminData.gates.filter(g => g.location_id === location.location_id && ["EXIT", "BOTH"].includes(g.gate_type));
    
    if (!entryGates.length || !exitGates.length) continue;
    
    const entryTime = randomDate(new Date("2024-01-01"), new Date());
    const durationHours = Math.floor(Math.random() * 6) + 1;
    const status = sessionStatuses[Math.floor(Math.random() * sessionStatuses.length)];
    const exitTime = status === "ACTIVE" ? null : new Date(entryTime.getTime() + durationHours * 3600000);
    
    sessions.push({
      session_id: generateId("SESS"),
      user_id: user.user_id,
      vehicle_id: vehicle.vehicle_id,
      location_id: location.location_id,
      slot_id: slot.slot_id,
      entry_gate_id: entryGates[0].gate_id,
      exit_gate_id: exitGates[0].gate_id,
      session_status: status,
      actual_entry_time: entryTime.toISOString(),
      actual_exit_time: exitTime?.toISOString() || null,
      duration_minutes: exitTime ? Math.round((exitTime - entryTime) / 60000) : null,
      payment_status: status === "ACTIVE" ? "PENDING" : "PAID",
      payment_id: generateId("PAY"),
      created_at: entryTime.toISOString(),
    });
  }
  return sessions;
};

export const generatePayments = (sessions, adminData) => {
  const eligibleSessions = sessions.filter(s => s.payment_status === "PAID" || s.session_status === "EXITED");
  if (!eligibleSessions.length) throw new Error("No completed sessions available for payment generation.");

  const methods = adminData?.paymentMethods?.length ? adminData.paymentMethods : fallbackPaymentMethods;

  return eligibleSessions.map((session) => {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const durationHours = session.duration_minutes ? session.duration_minutes / 60 : 2;
    const amount = Math.round(50 * durationHours); // 50 INR base rate mock
    
    return {
      payment_id: session.payment_id,
      transaction_reference: `TXN-${Date.now().toString(36).toUpperCase()}`,
      session_id: session.session_id,
      method_id: method.method_id,
      amount,
      currency: "INR",
      payment_status: "SUCCESS",
      processed_at: session.actual_exit_time || new Date().toISOString(),
      created_at: session.created_at,
    };
  });
};

export const generateReservations = (users, vehicles, adminData, count = 10) => {
  if (!users?.length || !vehicles?.length) throw new Error("Users and Vehicles required.");
  if (!adminData?.locations?.length || !adminData?.parkingSlots?.length || !adminData?.reservationClasses?.length) {
    throw new Error("Admin Data missing: Locations, Slots, and Reservation Classes required.");
  }

  const reservations = [];
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const userVehicles = vehicles.filter(v => v.user_id === user.user_id);
    if (!userVehicles.length) continue;
    
    const vehicle = userVehicles[Math.floor(Math.random() * userVehicles.length)];
    const location = adminData.locations[Math.floor(Math.random() * adminData.locations.length)];
    const slot = adminData.parkingSlots[Math.floor(Math.random() * adminData.parkingSlots.length)];
    const rClass = adminData.reservationClasses[Math.floor(Math.random() * adminData.reservationClasses.length)];
    
    const startTime = randomDate(new Date(), new Date(Date.now() + 7 * 86400000));
    const endTime = new Date(startTime.getTime() + (Math.floor(Math.random() * 6) + 1) * 3600000);
    
    reservations.push({
      reservation_id: generateId("RES"),
      user_id: user.user_id,
      vehicle_id: vehicle.vehicle_id,
      location_id: location.location_id,
      slot_id: slot.slot_id,
      class_id: rClass.class_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "CONFIRMED",
      created_at: new Date().toISOString(),
    });
  }
  return reservations;
};