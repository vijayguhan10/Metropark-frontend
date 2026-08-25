import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useCallback,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Camera,
  CarFront,
  CreditCard,
  Gauge,
  Radar,
  ScanLine,
  ShieldAlert,
  Wallet,
  Wifi,
  WifiOff,
} from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { connectToParkingStream } from "../../services/liveMonitorApi";
import "./VehicleFlowPage.css";

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "EV"];
const VEHICLE_TONES = {
  Sedan: {
    car: "from-slate-100 via-white to-slate-200",
    chip: "bg-slate-900 text-white",
  },
  SUV: {
    car: "from-violet-200 via-violet-100 to-white",
    chip: "bg-violet-100 text-violet-700",
  },
  Hatchback: {
    car: "from-amber-100 via-white to-amber-200",
    chip: "bg-amber-100 text-amber-700",
  },
  EV: {
    car: "from-emerald-100 via-white to-cyan-100",
    chip: "bg-emerald-100 text-emerald-700",
  },
};

const EVENT_TONES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
  accent: "border-violet-200 bg-violet-50 text-violet-700",
};

const STATUS_TONES = {
  Entering: "bg-cyan-100 text-cyan-800",
  "ANPR Scanning": "bg-violet-100 text-violet-800",
  "Gate Open": "bg-emerald-100 text-emerald-800",
  "Inside Parking": "bg-slate-100 text-slate-800",
  Exiting: "bg-cyan-100 text-cyan-800",
  Billing: "bg-amber-100 text-amber-800",
  "Payment Success": "bg-emerald-100 text-emerald-800",
  "Payment Failed": "bg-rose-100 text-rose-800",
  Suspended: "bg-rose-100 text-rose-800",
};

const BILLING_STAGES = [
  { label: "Vehicle Exit", icon: CarFront },
  { label: "Exit Event", icon: Radar },
  { label: "Message Queue", icon: Activity },
  { label: "Billing Worker", icon: Gauge },
  { label: "Wallet Service", icon: Wallet },
  { label: "Payment Service", icon: CreditCard },
  { label: "Result", icon: ShieldAlert },
];

// Start with zero metrics - will be updated from live data
const INITIAL_METRICS = {
  entered: 0,
  exited: 0,
  inside: 0,
  success: 0,
  failed: 0,
  pending: 0,
  suspended: 0,
  avgBillingTime: 0,
  queueRate: 0,
};

const FLOW_SPEED = 0.23; // Reduced speed for smoother animation
// Removed static ENTRY_FLOW_POSITIONS and EXIT_FLOW_POSITIONS - vehicles now come from live SSE stream
const MIN_VEHICLE_SPACING = 24; // Minimum progress percentage between vehicles in same lane
const MAX_VEHICLES_PER_LANE = 3;

let vehicleSequence = 0;
let eventSequence = 0;
let alertSequence = 0;

// SSE connection state
let simulationConnection = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Check if a new vehicle can be added to a lane without overlapping
function canAddVehicleToLane(
  vehicles,
  direction,
  minSpacing = MIN_VEHICLE_SPACING,
) {
  const laneVehicles = vehicles
    .filter((v) => v.direction === direction)
    .sort((a, b) => a.progress - b.progress);

  if (laneVehicles.length === 0) return true;
  if (laneVehicles.length >= MAX_VEHICLES_PER_LANE) return false;

  // For entry lane (progress goes 0->100), check the first vehicle (closest to start)
  // For exit lane (progress goes 0->100), check the first vehicle (closest to start)
  const firstVehicle = laneVehicles[0];
  return firstVehicle.progress >= minSpacing;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

// Static vehicle generation functions - COMMENTED OUT (using live SSE data only)
/*
function randomPlate() {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const digits = "0123456789";

  const pick = (source, count) =>
    Array.from(
      { length: count },
      () => source[Math.floor(Math.random() * source.length)],
    ).join("");

  return `${pick(letters, 2)}-${pick(digits, 2)}${pick(letters, 1)}-${pick(digits, 4)}`;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}
*/

// Parse SSE event data to extract vehicle info
function parseSSEEvent(eventData) {
  const { type, payload, timestamp } = eventData;
  const { session, slot, payment } = payload;

  // Extract plate from vehicleId or sessionId
  const plate = `MP-${session.sessionId}-${slot.slotId}`;

  // Determine vehicle type from vehicleTypeId
  const vehicleTypes = ["Sedan", "SUV", "Hatchback", "EV"];
  const vehicleType =
    vehicleTypes[(slot.vehicleTypeId || 1) % vehicleTypes.length];

  // Parse ISO timestamp strings to Date objects
  const parseISOTime = (timeStr) => {
    if (!timeStr) return null;
    return new Date(timeStr).getTime();
  };

  const entryTime = parseISOTime(session.actualEntryTime);
  const exitTime = parseISOTime(session.actualExitTime);

  // Calculate duration
  let durationMinutes = 0;
  if (entryTime && exitTime) {
    durationMinutes = Math.floor((exitTime - entryTime) / 60000);
  } else if (entryTime) {
    durationMinutes = Math.floor((Date.now() - entryTime) / 60000);
  }

  // Handle payment data (can be null)
  const paymentStatus =
    payment?.paymentStatus || session.paymentStatus || "UNKNOWN";
  const amount = payment?.amount || 0;
  const currency = payment?.currency || "INR";

  return {
    type, // 'vehicle.entry' or 'vehicle.exit'
    sessionId: session.sessionId,
    plate,
    vehicleType,
    sessionStatus: session.sessionStatus,
    paymentStatus,
    amount,
    currency,
    durationMinutes,
    entryTime: entryTime || Date.now(),
    exitTime,
    slotDisplayCode: slot.displayCode,
    locationId: slot.locationId,
    gateId: type === "vehicle.entry" ? session.entryGateId : session.exitGateId,
    timestamp: parseISOTime(timestamp) || Date.now(),
  };
}

function createEvent(type, vehicle, tone, description) {
  return {
    id: `event-${(eventSequence += 1)}`,
    type,
    tone,
    plate: vehicle.plate,
    description,
    time: formatTime(Date.now()),
  };
}

function createAlert(title, message, tone) {
  return {
    id: `alert-${(alertSequence += 1)}`,
    title,
    message,
    tone,
    createdAt: Date.now(),
  };
}

function buildMilestones(direction, outcome, sseData = null) {
  if (direction === "entry") {
    return [
      {
        at: 10,
        status: "Entering",
        event: "CAR_ENTERED",
        tone: "info",
        description:
          "Vehicle cleared the curb and is moving toward the entry gate.",
        metricDelta: { entered: 1, inside: 1, queueRateShift: 0.2 },
      },
      {
        at: 27,
        status: "ANPR Scanning",
        event: "ENTRY_SCAN_SUCCESS",
        tone: "accent",
        description: "Entry ANPR camera validated the incoming plate.",
      },
      {
        at: 41,
        status: "Gate Open",
        event: "BARRIER_OPENED",
        tone: "success",
        description: "Boom barrier opened and granted access.",
      },
      {
        at: 63,
        status: "Inside Parking",
        event: "CAR_INSIDE",
        tone: "info",
        description: "Vehicle is now inside the parking facility.",
      },
    ];
  }

  const failed = outcome !== "success";
  const milestones = [
    {
      at: 10,
      status: "Exiting",
      event: "CAR_EXITED",
      tone: "info",
      description:
        "Vehicle approached the exit gate and generated an exit event.",
      metricDelta: { exited: 1, inside: -1, queueRateShift: 0.35 },
    },
    {
      at: 25,
      status: "ANPR Scanning",
      event: "EXIT_SCAN_SUCCESS",
      tone: "accent",
      description: "Exit ANPR scan matched the active session.",
    },
    {
      at: 42,
      status: "Billing",
      event: "BILLING_STARTED",
      tone: "warning",
      description: "Billing worker picked up the exit message.",
      metricDelta: { pending: 1 },
    },
    {
      at: 56,
      status: "Billing",
      event: "PAYMENT_PROCESSING",
      tone: "warning",
      description: "Wallet and payment services are processing the fee.",
    },
  ];

  if (failed) {
    milestones.push(
      {
        at: 73,
        status: "Payment Failed",
        event: "PAYMENT_FAILED",
        tone: "danger",
        description: "Payment attempt failed due to insufficient balance.",
        metricDelta: { pending: -1, failed: 1, avgBillingTime: 3.7 },
        alert: {
          title: "Low Wallet Balance",
          message:
            "Payment failed. A retry has been queued for the exiting vehicle.",
          tone: "danger",
        },
      },
      {
        at: 87,
        status: "Suspended",
        event: "ACCOUNT_SUSPENDED",
        tone: "danger",
        description:
          "Vehicle profile was suspended and an operator alert was issued.",
        metricDelta: { suspended: 1, queueRateShift: -0.5 },
        alert: {
          title: "Vehicle Suspended",
          message: "Exit profile suspended after billing failure escalation.",
          tone: "danger",
        },
      },
      {
        at: 94,
        status: "Suspended",
        event: "SYSTEM_ALERT",
        tone: "danger",
        description:
          "System alert dispatched to the control center for manual review.",
        alert: {
          title: "Billing Timeout",
          message: "Manual intervention requested on a failed exit workflow.",
          tone: "warning",
        },
      },
    );
  } else {
    milestones.push(
      {
        at: 73,
        status: "Payment Success",
        event: "PAYMENT_SUCCESS",
        tone: "success",
        description:
          "Wallet deduction completed and receipt generation started.",
        metricDelta: { pending: -1, success: 1, avgBillingTime: 2.1 },
        alert: {
          title: "Payment Successful",
          message:
            "Billing completed and the exit lane is ready to release the vehicle.",
          tone: "success",
        },
      },
      {
        at: 88,
        status: "Gate Open",
        event: "BARRIER_OPENED",
        tone: "success",
        description: "Exit barrier opened after payment approval.",
      },
    );
  }

  return milestones;
}

function hydrateVehicle(vehicle, progress) {
  let status = vehicle.direction === "entry" ? "Entering" : "Exiting";
  let milestoneIndex = 0;

  vehicle.milestones.forEach((milestone, index) => {
    if (progress >= milestone.at) {
      status = milestone.status;
      milestoneIndex = index + 1;
    }
  });

  return {
    ...vehicle,
    progress,
    status,
    milestoneIndex,
  };
}

function createVehicleFromSSE(sseData, direction, progress = 0) {
  const outcome =
    direction === "exit"
      ? sseData.paymentStatus === "SUCCESS"
        ? "success"
        : "failed"
      : "success";

  const now = Date.now();
  const entryTime = sseData.entryTime || now;
  const exitTime = sseData.exitTime || now;
  const durationMinutes =
    sseData.durationMinutes || Math.floor(Math.random() * 220) + 18;

  const baseVehicle = {
    id: `vehicle-${(vehicleSequence += 1)}`,
    direction,
    plate: sseData.plate,
    type: sseData.vehicleType,
    speed: FLOW_SPEED,
    startedAt: now,
    entryTime: direction === "entry" ? entryTime : entryTime,
    exitTime: direction === "exit" ? exitTime : null,
    durationMinutes:
      direction === "entry"
        ? Math.floor(Math.random() * 12) + 1
        : durationMinutes,
    outcome,
    sseData, // Store original SSE data for reference
    milestones: buildMilestones(direction, outcome, sseData),
  };

  return hydrateVehicle(baseVehicle, progress);
}

// Fallback for when no SSE data is available - COMMENTED OUT (using live SSE data only)
/*
function createVehicle(direction, progress = 0) {
  const outcome =
    direction === "exit"
      ? Math.random() > 0.3
        ? "success"
        : "failed"
      : "success";
  const type = sample(VEHICLE_TYPES);
  const now = Date.now();
  const parkingDuration = Math.floor(Math.random() * 220) + 18;

  const baseVehicle = {
    id: `vehicle-${(vehicleSequence += 1)}`,
    direction,
    plate: randomPlate(),
    type,
    speed: FLOW_SPEED,
    startedAt: now,
    entryTime:
      direction === "entry"
        ? now - Math.floor(Math.random() * 6) * 60000
        : now - parkingDuration * 60000,
    exitTime: direction === "exit" ? now : null,
    durationMinutes:
      direction === "entry"
        ? Math.floor(Math.random() * 12) + 1
        : parkingDuration,
    outcome,
    milestones: buildMilestones(direction, outcome),
  };

  return hydrateVehicle(baseVehicle, progress);
}

function createSeedEvents() {
  const seedVehicle = {
    plate: "MP-45X-1298",
  };

  return [
    createEvent(
      "PAYMENT_SUCCESS",
      seedVehicle,
      "success",
      "Wallet deduction completed and receipt issued.",
    ),
    createEvent(
      "BILLING_STARTED",
      seedVehicle,
      "warning",
      "Message queue delivered a new billing job.",
    ),
    createEvent(
      "ENTRY_SCAN_SUCCESS",
      seedVehicle,
      "accent",
      "Entry ANPR camera validated the incoming plate.",
    ),
  ];
}
*/

function MetricTile({ label, value, hint, tone }) {
  const toneClass = {
    accent: "border-violet-200/70 bg-white/85",
    success: "border-emerald-200/70 bg-white/85",
    warning: "border-amber-200/70 bg-white/85",
    danger: "border-rose-200/70 bg-white/85",
    neutral: "border-slate-200/80 bg-white/85",
  };

  return (
    <div
      className={`status-glow rounded-[1.75rem] border p-4 ${toneClass[tone]}`}
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <motion.p
        key={`${label}-${value}`}
        initial={{ opacity: 0.3, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-3 text-3xl font-semibold text-slate-950"
      >
        {value}
      </motion.p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONES[status]}`}
    >
      {status}
    </span>
  );
}

function VehicleCard({ vehicle }) {
  const laneTop = vehicle.direction === "entry" ? 40 : 94;
  const horizontalPosition =
    vehicle.direction === "entry" ? vehicle.progress : 100 - vehicle.progress;
  const duration = vehicle.sseData
    ? formatDuration(vehicle.sseData.durationMinutes)
    : vehicle.direction === "entry"
      ? formatDuration(
          clamp(Math.floor((Date.now() - vehicle.entryTime) / 60000), 1, 45),
        )
      : formatDuration(vehicle.durationMinutes);
  const cardAnchorClass =
    horizontalPosition < 16
      ? "left-0 translate-x-0"
      : horizontalPosition > 86
        ? "right-0 translate-x-0"
        : "left-1/2 -translate-x-1/2";
  const laneLabel =
    vehicle.direction === "entry" ? "Inbound lane" : "Outbound lane";
  const hudTop = vehicle.direction === "entry" ? -118 : -116;
  const vehicleNumber = `Vehicle ${vehicle.plate}`;

  // Show SSE data indicator
  const isSSEVehicle = !!vehicle.sseData;

  return (
    <motion.div
      transition={{ duration: 0.12, ease: "linear" }}
      className="absolute"
      style={{
        top: `${laneTop}%`,
        left: `calc(${horizontalPosition}% - 42px)`,
      }}
    >
      <div className="relative overflow-visible">
        <motion.div
          className={`absolute w-44 ${cardAnchorClass}`}
          style={{ top: `${hudTop}px` }}
        >
          <div className="vehicle-hud relative rounded-[1.2rem] px-3 py-2.5 text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  {laneLabel}
                </p>
                <p className="mt-1 whitespace-nowrap text-sm font-semibold tracking-[0.14em] text-slate-950">
                  {vehicle.plate}
                </p>
                <p className="mt-1 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  {vehicleNumber}
                </p>
                {isSSEVehicle && (
                  <p className="mt-1 whitespace-nowrap text-[9px] uppercase tracking-[0.16em] text-emerald-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE DATA
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${VEHICLE_TONES[vehicle.type].chip}`}
              >
                {vehicle.type}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <StatusBadge status={vehicle.status} />
              <span className="whitespace-nowrap text-[11px] font-medium text-slate-500">
                {duration}
              </span>
            </div>
            {isSSEVehicle && vehicle.sseData && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>Slot: {vehicle.sseData.slotDisplayCode}</p>
                <p>Location: {vehicle.sseData.locationId}</p>
                {vehicle.sseData.amount && (
                  <p className="font-medium text-violet-600">
                    Amount: {vehicle.sseData.amount} {vehicle.sseData.currency}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function VehicleFlowPage() {
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [sseConnected, setSseConnected] = useState(false);
  const [sseError, setSseError] = useState(null);

  const vehiclesRef = useRef(vehicles);
  const metricsRef = useRef(metrics);
  const sseConnectionRef = useRef(null);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Handle incoming SSE events
  const handleSSEMessage = useCallback((eventData) => {
    console.log("Received SSE event:", eventData);

    try {
      const parsedEvent = parseSSEEvent(eventData);
      const {
        type,
        plate,
        vehicleType,
        sessionStatus,
        paymentStatus,
        durationMinutes,
        entryTime,
        exitTime,
      } = parsedEvent;

      if (type === "vehicle.entry") {
        // Create entry vehicle from SSE data
        const newVehicle = createVehicleFromSSE(parsedEvent, "entry", 0);

        // Check if we can add a vehicle to the entry lane without overlapping
        setVehicles((current) => {
          if (!canAddVehicleToLane(current, "entry")) {
            console.log(
              "Entry lane full or spacing insufficient, skipping vehicle",
            );
            return current;
          }

          // Check if vehicle already exists (by plate)
          const exists = current.some(
            (v) => v.plate === plate && v.direction === "entry",
          );
          if (exists) return current;

          // Add new vehicle at the beginning of entry lane
          const updated = [newVehicle, ...current];
          // Keep only a reasonable number of vehicles
          return updated.slice(0, 10);
        });

        // Add event to timeline
        setEvents((current) =>
          [
            createEvent(
              "CAR_ENTERED",
              newVehicle,
              "info",
              `Vehicle ${plate} entered via gate ${parsedEvent.gateId} at ${parsedEvent.slotDisplayCode}`,
            ),
            ...current,
          ].slice(0, 18),
        );

        // Update metrics
        setMetrics((prev) => ({
          ...prev,
          entered: prev.entered + 1,
          inside: prev.inside + 1,
        }));
      } else if (type === "vehicle.exit") {
        // Create exit vehicle from SSE data
        const newVehicle = createVehicleFromSSE(parsedEvent, "exit", 0);

        // Check if we can add a vehicle to the exit lane without overlapping
        setVehicles((current) => {
          if (!canAddVehicleToLane(current, "exit")) {
            console.log(
              "Exit lane full or spacing insufficient, skipping vehicle",
            );
            return current;
          }

          // Check if vehicle already exists (by plate)
          const exists = current.some(
            (v) => v.plate === plate && v.direction === "exit",
          );
          if (exists) return current;

          // Add new vehicle at the beginning of exit lane
          const updated = [newVehicle, ...current];
          return updated.slice(0, 10);
        });

        // Add event to timeline
        const eventType =
          paymentStatus === "SUCCESS" ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED";
        const eventTone = paymentStatus === "SUCCESS" ? "success" : "danger";
        const eventDescription =
          paymentStatus === "SUCCESS"
            ? `Payment of ${parsedEvent.amount} ${parsedEvent.currency} completed for ${plate}`
            : `Payment failed for ${plate} - ${paymentStatus}`;

        setEvents((current) =>
          [
            createEvent(eventType, newVehicle, eventTone, eventDescription),
            ...current,
          ].slice(0, 18),
        );

        // Update metrics
        setMetrics((prev) => ({
          ...prev,
          exited: prev.exited + 1,
          inside: Math.max(0, prev.inside - 1),
          success:
            paymentStatus === "SUCCESS" ? prev.success + 1 : prev.success,
          failed: paymentStatus !== "SUCCESS" ? prev.failed + 1 : prev.failed,
          pending: prev.pending + 1,
        }));

        // If payment failed, add alert
        if (paymentStatus !== "SUCCESS") {
          setAlerts((current) =>
            [
              createAlert(
                "Payment Failed",
                `Payment failed for vehicle ${plate}. Status: ${paymentStatus}`,
                "danger",
              ),
              ...current,
            ].slice(0, 4),
          );
        }
      }
    } catch (error) {
      console.error("Error processing SSE event:", error);
    }
  }, []);

  const handleSSEError = useCallback((error) => {
    console.error("SSE connection error:", error);
    setSseConnected(false);
    setSseError(error.message || "Connection failed");
  }, []);

  // Connect to SSE stream on mount
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds

    const connect = () => {
      const connection = connectToParkingStream(handleSSEMessage, (error) => {
        console.error("SSE connection error:", error);
        setSseConnected(false);
        setSseError(error.message || "Connection failed");

        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(
            `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`,
          );
          setTimeout(connect, reconnectDelay);
        }
      });
      sseConnectionRef.current = connection;
      setSseConnected(true);
      setSseError(null);
      reconnectAttempts = 0; // Reset on successful connection
    };

    connect();

    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
      }
      setSseConnected(false);
    };
  }, [handleSSEMessage]);

  const tickSimulation = useEffectEvent((deltaTime = 16.67) => {
    const emittedEvents = [];
    const emittedAlerts = [];
    let nextMetrics = { ...metricsRef.current };

    // Calculate speed based on deltaTime for frame-rate independent movement
    // Target: ~100 progress units over ~5 seconds at 60fps = ~0.33 per frame
    const frameSpeed = FLOW_SPEED * (deltaTime / 16.67);

    const nextVehicles = vehiclesRef.current
      .map((vehicle) => {
        const progress = vehicle.progress + frameSpeed;
        let nextVehicle = {
          ...vehicle,
          progress,
        };

        while (nextVehicle.milestoneIndex < nextVehicle.milestones.length) {
          const milestone = nextVehicle.milestones[nextVehicle.milestoneIndex];

          if (progress < milestone.at) {
            break;
          }

          nextVehicle = {
            ...nextVehicle,
            status: milestone.status,
            milestoneIndex: nextVehicle.milestoneIndex + 1,
          };

          emittedEvents.unshift(
            createEvent(
              milestone.event,
              nextVehicle,
              milestone.tone,
              milestone.description,
            ),
          );

          if (milestone.alert) {
            emittedAlerts.unshift(
              createAlert(
                milestone.alert.title,
                milestone.alert.message,
                milestone.alert.tone,
              ),
            );
          }

          if (milestone.metricDelta) {
            nextMetrics = {
              ...nextMetrics,
              entered:
                nextMetrics.entered + (milestone.metricDelta.entered ?? 0),
              exited: nextMetrics.exited + (milestone.metricDelta.exited ?? 0),
              inside: clamp(
                nextMetrics.inside + (milestone.metricDelta.inside ?? 0),
                0,
                9999,
              ),
              success:
                nextMetrics.success + (milestone.metricDelta.success ?? 0),
              failed: nextMetrics.failed + (milestone.metricDelta.failed ?? 0),
              pending: clamp(
                nextMetrics.pending + (milestone.metricDelta.pending ?? 0),
                0,
                999,
              ),
              suspended:
                nextMetrics.suspended + (milestone.metricDelta.suspended ?? 0),
              avgBillingTime:
                milestone.metricDelta.avgBillingTime !== undefined
                  ? Number(
                      (
                        nextMetrics.avgBillingTime * 0.82 +
                        milestone.metricDelta.avgBillingTime * 0.18
                      ).toFixed(1),
                    )
                  : nextMetrics.avgBillingTime,
              queueRate: Number(
                clamp(
                  nextMetrics.queueRate +
                    (milestone.metricDelta.queueRateShift ?? 0),
                  8,
                  32,
                ).toFixed(1),
              ),
            };
          }
        }

        if (progress >= 100) {
          // When vehicle completes its journey, remove it
          // SSE vehicles are removed after they complete - new vehicles come from live SSE stream
          return null;
        }

        return nextVehicle;
      })
      .filter(Boolean); // Remove null entries

    nextMetrics = {
      ...nextMetrics,
      queueRate: Number(
        clamp(
          nextMetrics.queueRate + (Math.random() - 0.5) * 0.08,
          8,
          32,
        ).toFixed(1),
      ),
    };

    vehiclesRef.current = nextVehicles;
    metricsRef.current = nextMetrics;
    setVehicles(nextVehicles);
    setMetrics(nextMetrics);

    if (emittedEvents.length > 0) {
      setEvents((current) => [...emittedEvents, ...current].slice(0, 18));
    }

    setAlerts((current) =>
      [...emittedAlerts, ...current]
        .filter((alert) => Date.now() - alert.createdAt < 12000)
        .slice(0, 4),
    );
  });

  useEffect(() => {
    let animationFrameId;
    let lastTime = null;

    const animate = (currentTime) => {
      if (lastTime === null) {
        lastTime = currentTime;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = Math.min(currentTime - lastTime, 50);
      lastTime = currentTime;

      tickSimulation(deltaTime);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [tickSimulation]);

  const billingVehicle =
    vehicles.find(
      (vehicle) => vehicle.direction === "exit" && vehicle.status === "Billing",
    ) ??
    vehicles.find((vehicle) =>
      vehicle.direction === "exit"
        ? [
            "Payment Success",
            "Payment Failed",
            "Suspended",
            "Gate Open",
          ].includes(vehicle.status)
        : false,
    ) ??
    vehicles.find((vehicle) => vehicle.direction === "exit");

  const billingStageIndex = (() => {
    if (!billingVehicle) {
      return 0;
    }

    if (billingVehicle.progress < 12) return 0;
    if (billingVehicle.progress < 25) return 1;
    if (billingVehicle.progress < 42) return 2;
    if (billingVehicle.progress < 56) return 3;
    if (billingVehicle.progress < 73) return 4;
    if (billingVehicle.progress < 88) return 5;
    return 6;
  })();

  const topAlerts = alerts.map((alert) => ({
    ...alert,
    classes:
      alert.tone === "success"
        ? "border-emerald-200 bg-white/95 text-emerald-700"
        : alert.tone === "danger"
          ? "border-rose-200 bg-white/95 text-rose-700"
          : "border-amber-200 bg-white/95 text-amber-700",
  }));
  const entryVehicles = vehicles
    .filter((vehicle) => vehicle.direction === "entry")
    .sort((left, right) => left.progress - right.progress);
  const exitVehicles = vehicles
    .filter((vehicle) => vehicle.direction === "exit")
    .sort((left, right) => left.progress - right.progress);

  return (
    <section className="vehicle-flow-shell rounded-[2rem] border border-white/70 px-4 py-5 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6">
      <div className="vehicle-flow-grid relative z-10 rounded-[1.7rem] border border-slate-200/70 bg-white/72 p-4 sm:p-6">
        <PageHeader
          eyebrow="Premium live operations"
          title="Real-time vehicle entry and exit monitor"
          description="A one-page command center focused entirely on gate movement, ANPR scans, event generation, and asynchronous billing outcomes."
          actions={
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Parking stream
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                <Radar size={14} />
                Billing-linked exits
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                  sseConnected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {sseConnected ? (
                  <>
                    <Wifi size={14} />
                    SSE Connected
                  </>
                ) : (
                  <>
                    <WifiOff size={14} />
                    SSE Disconnected
                  </>
                )}
              </div>
            </div>
          }
        />

        <div className="pointer-events-none absolute right-6 top-6 z-20 hidden xl:block">
          <div className="relative w-80">
            <AnimatePresence initial={false}>
              {topAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 36, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: index * 10 }}
                  exit={{ opacity: 0, x: 36, y: -10 }}
                  transition={{ duration: 0.28 }}
                  className={`pointer-events-auto absolute right-0 w-full rounded-2xl border px-4 py-3 shadow-[0_18px_42px_rgba(15,23,42,0.12)] ${alert.classes}`}
                >
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-1 text-xs opacity-85">{alert.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-slate-950/80 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-violet-600">
                    Lane orchestration
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Live Entry and Exit Lanes
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    ANPR dual camera
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    Queue-aware billing
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    60 FPS motion
                  </span>
                </div>
              </div>

              <div className="road-surface  relative h-[32rem] rounded-[1.6rem]">
                <div className="lane-divider" />
                <div className="lane-dashes" />

                <div className="absolute left-[18%] top-[14%] rounded-full border border-white/10 bg-white/8 p-2.5 text-white/75">
                  <Radar size={20} />
                </div>

                <div className="absolute left-[42%] top-[12%] text-white">
                  <div className="camera-flash rounded-2xl border border-violet-300/40 bg-violet-400/16 p-3">
                    <Camera size={22} />
                  </div>
                </div>

                <div className="absolute left-[57%] top-[18%] h-1 w-[14%] rounded-full bg-white/15">
                  <div className="barrier-arm h-full w-full rounded-full bg-gradient-to-r from-white to-emerald-300" />
                </div>
                <div className="absolute left-[58%] top-[22%] text-[11px] font-medium uppercase tracking-[0.24em] text-white/65">
                  Entry Gate
                </div>

                <div className="absolute left-[42%] top-[62%] text-white">
                  <div className="camera-flash rounded-2xl border border-violet-300/40 bg-violet-400/16 p-3">
                    <ScanLine size={22} />
                  </div>
                </div>

                <div className="absolute right-[13%] top-[68%] h-1 w-[14%] rounded-full bg-white/15">
                  <div className="barrier-arm exit h-full w-full rounded-full bg-gradient-to-l from-white to-emerald-300" />
                </div>
                <div className="absolute right-[13%] top-[72%] text-[11px] font-medium uppercase tracking-[0.24em] text-white/65">
                  Exit Gate
                </div>

                {entryVehicles.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
                {exitVehicles.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-violet-600">
                    Asynchronous billing
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Exit-to-payment pipeline
                  </h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  Tracking {billingVehicle?.plate ?? "No active exit"}
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-7">
                {BILLING_STAGES.map((stage, index) => {
                  const Icon = stage.icon;
                  const isActive = index <= billingStageIndex;
                  const isResult = index === BILLING_STAGES.length - 1;
                  const resultFailed =
                    isResult &&
                    ["Payment Failed", "Suspended"].includes(
                      billingVehicle?.status ?? "",
                    );
                  const resultSuccess =
                    isResult &&
                    ["Payment Success", "Gate Open"].includes(
                      billingVehicle?.status ?? "",
                    );

                  return (
                    <div
                      key={stage.label}
                      className="flex items-center gap-3 xl:block"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3 xl:block">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-[1.25rem] border ${
                            resultFailed
                              ? "border-rose-200 bg-rose-50 text-rose-600"
                              : resultSuccess
                                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                : isActive
                                  ? "border-violet-200 bg-violet-50 text-violet-700"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          <Icon size={24} />
                        </div>
                        <div className="min-w-0 xl:mt-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {stage.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {index === billingStageIndex
                              ? (billingVehicle?.status ?? "Queued")
                              : "Monitoring"}
                          </p>
                        </div>
                      </div>

                      {index < BILLING_STAGES.length - 1 ? (
                        <div className="flow-track hidden h-2 flex-1 rounded-full bg-slate-100 xl:mt-6 xl:block" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
              <MetricTile
                label="Vehicles Entered Today"
                value={metrics.entered.toLocaleString()}
                hint="Updated when cars clear entry detection."
                tone="accent"
              />
              <MetricTile
                label="Vehicles Exited Today"
                value={metrics.exited.toLocaleString()}
                hint="Exit events generate queue jobs instantly."
                tone="neutral"
              />
              <MetricTile
                label="Currently Inside"
                value={metrics.inside.toLocaleString()}
                hint="Net active presence inside the facility."
                tone="neutral"
              />
              <MetricTile
                label="Successful Payments"
                value={metrics.success.toLocaleString()}
                hint="Approved exits with barrier release."
                tone="success"
              />
              <MetricTile
                label="Failed Payments"
                value={metrics.failed.toLocaleString()}
                hint="Insufficient balance or gateway failure."
                tone="danger"
              />
              <MetricTile
                label="Pending Billing Jobs"
                value={metrics.pending.toLocaleString()}
                hint="Messages waiting in worker processing."
                tone="warning"
              />
              <MetricTile
                label="Suspended Vehicles"
                value={metrics.suspended.toLocaleString()}
                hint="Profiles flagged after failed exit billing."
                tone="danger"
              />
              <MetricTile
                label="Average Billing Time"
                value={`${metrics.avgBillingTime.toFixed(1)}s`}
                hint={`${metrics.queueRate.toFixed(1)} jobs/min current queue rate`}
                tone="accent"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-violet-600">
                    Live event stream
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Vehicle and billing timeline
                  </h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  Newest first
                </div>
              </div>

              <div className="event-scroll mt-5 space-y-3">
                <AnimatePresence initial={false}>
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.24 }}
                      className="rounded-[1.4rem] border border-slate-200/80 bg-white/92 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${EVENT_TONES[event.tone]}`}
                            >
                              {event.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              {event.time}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                            <p className="text-sm font-semibold tracking-[0.12em] text-slate-900">
                              {event.plate}
                            </p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {event.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="mt-1 shrink-0 text-slate-300"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-violet-600">
                    Alert center
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Priority notifications
                  </h3>
                </div>
                <AlertTriangle size={18} className="text-amber-500" />
              </div>

              <div className="mt-5 space-y-3">
                {topAlerts.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No active alerts. The exit queue is stable.
                  </div>
                ) : (
                  topAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-[1.4rem] border p-4 ${alert.classes}`}
                    >
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="mt-1 text-sm opacity-90">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-violet-600">
                    Lane systems
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">
                    Operational status
                  </h3>
                </div>
                <Activity size={18} className="text-emerald-500" />
              </div>

              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Entry ANPR",
                    value: "99.6% plate recognition",
                    tone: "bg-emerald-500",
                  },
                  {
                    label: "Exit hold queue",
                    value: `${metrics.pending} job(s) awaiting settlement`,
                    tone: "bg-amber-500",
                  },
                  {
                    label: "Billing worker",
                    value: `${metrics.queueRate.toFixed(1)} jobs/min throughput`,
                    tone: "bg-violet-500",
                  },
                  {
                    label: "Escalation health",
                    value: `${metrics.suspended} suspended profiles under watch`,
                    tone: "bg-rose-500",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.tone}`}
                      />
                      <p className="text-sm font-medium text-slate-900">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
