import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  MapPin,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { parkingSessionsApi } from "../../api";
import { reservations as mockReservations } from "../../data/mockData";

const STATUS_CONFIG = {
  CREATED: {
    label: "Created",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    Icon: Clock,
  },
  ACTIVE: {
    label: "Active",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
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

function calcDuration(entry, exit) {
  if (!entry || !exit) return "—";
  try {
    const mins = Math.round((new Date(exit) - new Date(entry)) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  } catch {
    return "—";
  }
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.EXITED;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}
    >
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function SessionRow({ item }) {
  const id = item.session_id ?? item.sessionId ?? item.id;
  const slot = item.slot_id ?? item.slotId ?? item.slotNumber ?? "—";
  const location = item.locationName || item.location_name || `Slot ${slot}`;
  const status = (
    item.session_status ||
    item.sessionStatus ||
    item.status ||
    "EXITED"
  ).toUpperCase();
  const entry =
    item.actual_entry_time || item.actualEntryTime || item.entryTime;
  const exit = item.actual_exit_time || item.actualExitTime || item.exitTime;
  const mins = item.duration_minutes ?? item.durationMinutes;
  const duration = mins
    ? `${Math.floor(mins / 60)}h ${mins % 60}m`
    : calcDuration(entry, exit);

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
      <td className="px-4 py-4 text-sm text-slate-300">{formatTs(entry)}</td>
      <td className="px-4 py-4 text-sm text-slate-300">{formatTs(exit)}</td>
      <td className="px-4 py-4 text-sm text-slate-300">{duration}</td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}

export default function History() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingSessionsApi.getByUser(session?.user_id);
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions(mockReservations);
      setError("Could not reach server — showing demo data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [session?.user_id]);

  return (
    <div className="min-h-screen bg-white-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Parking History</h1>
            <p className="text-slate-400 text-sm mt-1">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-white-800/60 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">
                No parking sessions yet
              </p>
              <button
                onClick={() => navigate("/explorer")}
                className="mt-4 text-violet-400 text-sm hover:underline"
              >
                Find a parking spot
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/80">
                    {[
                      "Session",
                      "Location",
                      "Entry",
                      "Exit",
                      "Duration",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((item, i) => (
                    <SessionRow
                      key={item.session_id || item.id || i}
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
