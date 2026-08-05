import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { reservationsApi } from "../../api";
import { reservations as mockReservations } from "../../data/mockData";

const STATUS_CONFIG = {
  WAITING: {
    label: "Waiting",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    Icon: Clock,
  },
  ACTIVE: {
    label: "Active",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    Icon: CheckCircle,
  },
  RESERVED: {
    label: "Reserved",
    color: "text-violet-400 bg-violet-400/10 border-violet-400/30",
    Icon: CheckCircle,
  },
  EXITED: {
    label: "Completed",
    color: "text-slate-400 bg-white-400/10 border-slate-400/30",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
    Icon: XCircle,
  },
  // Mock data statuses
  active: {
    label: "Active",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    Icon: CheckCircle,
  },
  exited: {
    label: "Completed",
    color: "text-slate-400 bg-white-400/10 border-slate-400/30",
    Icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
    Icon: XCircle,
  },
};

function formatTs(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return ts;
  }
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.WAITING;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}
    >
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ReservationRow({ item }) {
  const id = item.reservation_id ?? item.reservationId ?? item.id;
  const slot = item.slot_id ?? item.slotId ?? item.slotNumber ?? "—";
  const location = item.locationName || item.location_name || `Slot ${slot}`;
  const status = (
    item.reservation_status ||
    item.reservationStatus ||
    item.status ||
    "WAITING"
  ).toUpperCase();
  const created =
    item.created_at || item.createdAt || item.reservedAt || item.reserved_at;
  const expires = item.expires_at || item.expiresAt || item.expectedExit;

  return (
    <tr className="border-b border-slate-800/60 hover:bg-white-800/30 transition-colors">
      <td className="px-4 py-4 text-sm font-mono text-slate-400">
        #{String(id).padStart(4, "0")}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-sm text-white font-medium">{location}</span>
        </div>
        {slot !== "—" && (
          <p className="text-xs text-slate-500 mt-0.5 pl-5">Slot {slot}</p>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-slate-300">{formatTs(created)}</td>
      <td className="px-4 py-4 text-sm text-slate-300">{formatTs(expires)}</td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}

export default function Reservations() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservationsApi.getByUser(session?.user_id);
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      setReservations(mockReservations);
      setError("Could not reach server — showing demo data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [session?.user_id]);

  const filtered = reservations.filter((r) => {
    if (activeFilter === "all") return true;
    const s = (
      r.reservation_status ||
      r.reservationStatus ||
      r.status ||
      ""
    ).toLowerCase();
    if (activeFilter === "active")
      return s === "active" || s === "waiting" || s === "reserved";
    if (activeFilter === "completed")
      return s === "exited" || s === "completed";
    if (activeFilter === "cancelled") return s === "cancelled";
    return true;
  });

  const TABS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-white-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Reservations</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filtered.length} reservation{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchReservations}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-all disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => navigate("/explorer")}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 bg-white-800/40 border border-slate-700/40 rounded-xl p-1 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeFilter === key
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-white-800/60 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">
                No reservations found
              </p>
              <button
                onClick={() => navigate("/explorer")}
                className="mt-4 text-violet-400 text-sm hover:underline"
              >
                Book your first spot
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/80">
                    {["ID", "Location", "Reserved At", "Expires", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <ReservationRow
                      key={item.reservation_id || item.id || i}
                      item={item}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
