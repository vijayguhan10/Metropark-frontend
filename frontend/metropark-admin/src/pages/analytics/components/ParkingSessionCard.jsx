import {
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  CreditCard,
  DoorOpen,
  Hash,
  Clock as ClockIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState, useMemo } from "react";

const StatusIcon = ({ status }) => {
  const icons = {
    ACTIVE: <CheckCircle className="h-4 w-4 text-emerald-600" />,
    EXITED: <CheckCircle className="h-4 w-4 text-violet-600" />,
    CANCELLED: <XCircle className="h-4 w-4 text-rose-600" />,
    PENDING: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    PAID: <CheckCircle className="h-4 w-4 text-emerald-600" />,
    FAILED: <XCircle className="h-4 w-4 text-rose-600" />,
    REFUNDED: <AlertCircle className="h-4 w-4 text-slate-600" />,
    SUCCESS: <CheckCircle className="h-4 w-4 text-emerald-600" />,
    PROCESSING: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
  };
  return icons[status] || <AlertCircle className="h-4 w-4 text-slate-600" />;
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className = "",
  valueClassName = "",
}) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className={`text-sm text-slate-900 truncate ${valueClassName}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

export const ParkingSessionCard = ({
  session,
  usersData = [],
  vehiclesData = [],
  locationsData = [],
  gatesData = [],
  paymentsData = [],
  onClick,
  index,
}) => {
  const user = usersData.find((u) => u.user_id === session.user_id);
  const vehicle = vehiclesData.find((v) => v.vehicle_id === session.vehicle_id);
  const location = locationsData.find(
    (l) => l.location_id === session.location_id,
  );
  const entryGate = gatesData.find((g) => g.gate_id === session.entry_gate_id);
  const exitGate = gatesData.find((g) => g.gate_id === session.exit_gate_id);
  const payment = paymentsData.find((p) => p.session_id === session.session_id);

  const statusColors = {
    ACTIVE: "bg-emerald-50 border-emerald-200",
    EXITED: "bg-violet-50 border-violet-200",
    CANCELLED: "bg-rose-50 border-rose-200",
    PENDING: "bg-amber-50 border-amber-200",
  };

  const statusColorClass =
    statusColors[session.session_status] || "bg-slate-50 border-slate-200";

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "—";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "—";
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <article
      className={`rounded-2xl w-full border transition-all hover:shadow-md ${statusColorClass} ${onClick ? "cursor-pointer hover:border-(--app-violet)/50" : ""}`}
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Row 1: Header - Identifiers & Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50 rounded-t-2xl gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-white border border-slate-200">
            <Hash className="h-5 w-5 text-(--app-violet)" />
          </div>
          <div className="min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <div>
              <p className="font-semibold text-slate-900 truncate">
                {session.reservation_id
                  ? `Reservation: ${session.reservation_id}`
                  : "Walk-in session"}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {/* Session: {session.session_id?.slice(-8) || session.session_id} */}
              </p>
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {vehicle ? `${vehicle.vehicle_number}` : session.vehicle_id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600 truncate max-w-[150px]">
                  {user ? user.name : session.user_id}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={session.session_status}>
            <span className="flex items-center gap-1">
              <StatusIcon status={session.session_status} />
              {session.session_status}
            </span>
          </StatusBadge>
          {payment && (
            <StatusBadge status={payment.payment_status}>
              <span className="flex items-center gap-1">
                <StatusIcon status={payment.payment_status} />
                {payment.payment_status}
              </span>
            </StatusBadge>
          )}
        </div>
      </div>

      {/* Row 2: Location, Slot, & Timing */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-white">
        <InfoRow
          className="md:col-span-2"
          icon={MapPin}
          label="Location"
          value={location?.location_name || session.location_id}
        />
        <InfoRow
          className="md:col-span-2"
          icon={Hash}
          label="Slot"
          value={session.slot_display_code || session.slot_id || "—"}
          valueClassName="font-mono font-medium"
        />
        <InfoRow
          className="md:col-span-2"
          icon={DoorOpen}
          label="Entry Gate"
          value={entryGate?.gate_name || session.entry_gate_id || "—"}
        />
        <InfoRow
          className="md:col-span-3"
          icon={ClockIcon}
          label="Entry Time"
          value={
            session.actual_entry_time
              ? new Date(session.actual_entry_time).toLocaleString()
              : "—"
          }
        />
        <InfoRow
          className="md:col-span-3"
          icon={ClockIcon}
          label="Exit Time"
          value={
            session.actual_exit_time
              ? new Date(session.actual_exit_time).toLocaleString()
              : session.expected_exit_time
                ? `Exp: ${new Date(session.expected_exit_time).toLocaleString()}`
                : "—"
          }
        />
      </div>

      {/* Row 3: Billing & System Info */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 p-4 bg-white rounded-b-2xl">
        <InfoRow
          className="md:col-span-2"
          icon={Clock}
          label="Duration"
          value={formatDuration(session.duration_minutes)}
          valueClassName="font-medium"
        />
        <InfoRow
          className="md:col-span-2"
          icon={CreditCard}
          label="Amount"
          value={formatCurrency(payment?.amount)}
          valueClassName="text-emerald-600 font-semibold"
        />
        <InfoRow
          className="md:col-span-2"
          icon={CreditCard}
          label="Method"
          value={payment?.method_name?.replace("_", " ") || "—"}
        />
        <InfoRow
          className="md:col-span-2"
          icon={Hash}
          label="Version"
          value={session.session_version}
          valueClassName="font-mono"
        />
        <InfoRow
          className="md:col-span-2"
          icon={Calendar}
          label="Created"
          value={
            session.created_at
              ? new Date(session.created_at).toLocaleString()
              : "—"
          }
        />
        <InfoRow
          className="md:col-span-2"
          icon={ClockIcon}
          label="Updated"
          value={
            session.updated_at
              ? new Date(session.updated_at).toLocaleString()
              : "—"
          }
        />
      </div>
    </article>
  );
};

const SearchInput = ({ value, onChange, placeholder, onClear }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) placeholder:text-slate-400"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const MultiSelectFilter = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = (val) => {
    const newValue = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newValue);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-(--app-violet)/20 focus:border-(--app-violet) text-left flex items-center justify-between"
      >
        <span className={value.length ? "text-slate-900" : "text-slate-400"}>
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded border-slate-300 text-(--app-violet) focus:ring-(--app-violet)"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const ParkingSessionsGrid = ({
  sessions,
  usersData = [],
  vehiclesData = [],
  locationsData = [],
  gatesData = [],
  paymentsData = [],
  loading = false,
  error = null,
  emptyMessage = "No parking sessions found",
  onSessionClick,
  searchKey = "session_id",
  filterOptions = {},
  onFiltersChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilters, setLocalFilters] = useState({});

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const filteredSessions = useMemo(() => {
    const sessionsArray = Array.isArray(sessions) ? sessions : [];
    return sessionsArray.filter((session) => {
      // Search filter
      if (searchTerm && searchKey) {
        const searchValue = String(session[searchKey] || "").toLowerCase();
        if (!searchValue.includes(searchTerm.toLowerCase())) return false;
      }

      // Column filters
      for (const [filterKey, filterValue] of Object.entries(localFilters)) {
        if (
          !filterValue ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        )
          continue;

        const sessionValue = session[filterKey];
        if (Array.isArray(filterValue)) {
          if (!filterValue.includes(sessionValue)) return false;
        } else if (sessionValue !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }, [sessions, searchTerm, searchKey, localFilters]);

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : true),
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocalFilters({});
    onFiltersChange?.({});
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl border border-slate-200 bg-white animate-pulse"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl h-16 flex items-center">
              <div className="h-10 w-10 rounded-xl bg-slate-200 mr-4" />
              <div className="h-4 w-48 bg-slate-200 rounded" />
            </div>
            <div className="p-4 border-b border-slate-100 h-20" />
            <div className="p-4 h-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-rose-600">
        <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">{error}</p>
        <p className="text-sm text-slate-500 mt-1">
          Unable to load parking sessions
        </p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-slate-700">{emptyMessage}</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="border-b border-slate-200 pb-4 bg-slate-50/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search sessions..."
              onClear={() => setSearchTerm("")}
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="w-48">
                {options.type === "multi" ? (
                  <MultiSelectFilter
                    value={localFilters[key] || []}
                    onChange={(v) => handleFilterChange(key, v)}
                    options={options.options}
                    placeholder={options.placeholder}
                  />
                ) : (
                  <SelectFilter
                    value={localFilters[key] || ""}
                    onChange={(v) => handleFilterChange(key, v)}
                    options={options.options}
                    placeholder={options.placeholder}
                  />
                )}
              </div>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Grid - Full width, Single Column */}
      <div className="flex flex-col gap-4">
        {filteredSessions.map((session, index) => (
          <ParkingSessionCard
            key={session.session_id}
            session={session}
            usersData={usersData}
            vehiclesData={vehiclesData}
            locationsData={locationsData}
            gatesData={gatesData}
            paymentsData={paymentsData}
            onClick={() => onSessionClick?.(session)}
            index={index}
          />
        ))}
      </div>

      {filteredSessions.length > 0 && (
        <div className="border-t border-slate-200 pt-3 text-sm text-slate-500">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </div>
      )}
    </div>
  );
};
